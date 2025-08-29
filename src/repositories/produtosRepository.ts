import { query } from "../config/db";
import { Produto, ProdutoCreate, ProdutoUpdate } from "../domain/produtos";
import { listPaged } from "../shared/sql-paging";
import { PageOpts } from "../shared/pagination";

const COLS = "id, nome, descricao, categorias_id, preco, ativo, data_criacao, data_atualizacao";
const ORDERABLE = new Set(["id", "nome", "descricao", "categorias_id", "preco", "ativo", "data_criacao", "data_atualizacao"]);

export async function listProdutos({ limit = 50, offset = 0 }) {
    const l = Math.max(1, parseInt(String(limit), 10) || 50);
    const o = Math.max(0, parseInt(String(offset), 10) || 0);
    const sql = `SELECT ${COLS} FROM produtos ORDER BY id LIMIT ${o}, ${l}`;
    const rows = await query<Produto>(sql);
    return rows;
}

export function listProdutosPaged(opts: PageOpts) {
    return listPaged<Produto>({
        table: "produtos",
        columns: COLS,
        searchable: ["nome", "descricao", "categorias_id", "preco",],
        orderable: ORDERABLE
    }, opts);
}

export async function searchProdutos(p: {
    nome?: string; descricao?: string; q?: string;
    limit: number; offset: number;
}): Promise<{ items: Produto[]; total: number }> {
    const where: string[] = [];
    const params: any[] = [];

    if (p.nome) { where.push("nome LIKE ?"); params.push(`%${p.nome}%`); }
    if (p.descricao) { where.push("descricao LIKE ?"); params.push(`%${p.descricao}%`); }

    if (p.q) {
        where.push("(nome LIKE ? OR descricao LIKE ?)");
        const s = `%${p.q}%`;
        params.push(s, s, s);
    }

    const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

    const countSql = `SELECT COUNT(*) AS total FROM produtos ${whereSql}`;
    const [{ total = 0 } = { total: 0 }] = await query<{ total: number }>(countSql, params);

    const off = Number.isInteger(p.offset) && p.offset >= 0 ? p.offset : 0;
    const lim = Number.isInteger(p.limit) && p.limit > 0 ? p.limit : 10;

    const dataSql = `SELECT ${COLS} FROM produtos ${whereSql} ORDER BY id ASC LIMIT ${off}, ${lim}`;
    const items = await query<Produto>(dataSql, params);

    return { items, total };
}

export async function getProdutoById(id: number) {
    const rows = await query<Produto>(`SELECT ${COLS} FROM produtos WHERE id = ?`, [id]);
    return rows[0] ?? null;
}

export async function createProduto(data: ProdutoCreate) {
    const { nome, descricao, categorias_id, preco, ativo = true } = data;
    const rows = await query<any>(
        `INSERT INTO produtos (nome, descricao, categorias_id, preco, ativo) VALUES (?,?,?,?,?)`,
        [nome, descricao, categorias_id, preco, ativo ? 1 : 0]
    );
    const idRow = await query<{ id: number }>(`SELECT LAST_INSERT_ID() AS id`);
    const created = await getProdutoById(idRow[0].id);
    return created!;
}

function buildUpdate(fields: ProdutoUpdate) {
    const entries = Object.entries(fields).filter(([, v]) => v !== undefined);
    if (entries.length === 0) return { sql: "", params: [] as any[] };

    const sets = entries.map(([k]) => `${k} = ?`).join(", ");
    const params = entries.map(([k, v]) =>
        k === "ativo" ? (v ? 1 : 0) : v
    );
    return { sql: sets, params };
}

// export async function updateProduto(id: number, fields: ProdutoUpdate) {
//     const { sql, params } = buildUpdate(fields);
//     if (!sql) return getProdutoById(id);

//     await query(`UPDATE produtos SET ${sql} WHERE id = ?`, [...params, id]);
//     return getProdutoById(id);
// }

export async function updateProduto(id: number, fields: ProdutoUpdate) {
    const { sql, params } = buildUpdate(fields);
  
    // sempre atualizar data_atualizacao
    const setSql = sql ? `${sql}, data_atualizacao = NOW()` : `data_atualizacao = NOW()`;
  
    await query(`UPDATE produtos SET ${setSql} WHERE id = ?`, [...params, id]);
    return getProdutoById(id);
}  

export async function deleteProduto(id: number) {
    const rows = await query<any>(`DELETE FROM produtos WHERE id = ?`, [id]);
    const still = await getProdutoById(id);
    return !still;
}
