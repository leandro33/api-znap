import { query } from "../config/db";
import { Categoria, CategoriaCreate, CategoriaUpdate } from "../domain/categorias";
import { listPaged } from "../shared/sql-paging";
import { PageOpts } from "../shared/pagination";

const COLS = "id, nome, descricao, ativo, data_criacao, data_atualizacao";
const ORDERABLE = new Set(["id", "nome", "descricao", "ativo", "data_criacao", "data_atualizacao"]);

export async function listCategorias({ limit = 50, offset = 0 }) {
    const l = Math.max(1, parseInt(String(limit), 10) || 50);
    const o = Math.max(0, parseInt(String(offset), 10) || 0);
    const sql = `SELECT ${COLS} FROM categorias ORDER BY id LIMIT ${o}, ${l}`;
    const rows = await query<Categoria>(sql);
    return rows;
}

export function listCategoriasPaged(opts: PageOpts) {
    return listPaged<Categoria>({
        table: "categorias",
        columns: COLS,
        searchable: ["nome", "descricao"],
        orderable: ORDERABLE
    }, opts);
}

export async function searchCategorias(p: {
    nome?: string; descricao?: string; q?: string;
    limit: number; offset: number;
}): Promise<{ items: Categoria[]; total: number }> {
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

    const countSql = `SELECT COUNT(*) AS total FROM categorias ${whereSql}`;
    const [{ total = 0 } = { total: 0 }] = await query<{ total: number }>(countSql, params);

    const off = Number.isInteger(p.offset) && p.offset >= 0 ? p.offset : 0;
    const lim = Number.isInteger(p.limit) && p.limit > 0 ? p.limit : 10;

    const dataSql = `SELECT ${COLS} FROM categorias ${whereSql} ORDER BY id ASC LIMIT ${off}, ${lim}`;
    const items = await query<Categoria>(dataSql, params);

    return { items, total };
}

export async function getCategoriaById(id: number) {
    const rows = await query<Categoria>(`SELECT ${COLS} FROM categorias WHERE id = ?`, [id]);
    return rows[0] ?? null;
}

export async function createCategoria(data: CategoriaCreate) {
    const { nome, descricao, ativo = true } = data;
    const rows = await query<any>(
        `INSERT INTO categorias (nome, descricao, ativo) VALUES (?,?,?)`,
        [nome, descricao, ativo ? 1 : 0]
    );
    const idRow = await query<{ id: number }>(`SELECT LAST_INSERT_ID() AS id`);
    const created = await getCategoriaById(idRow[0].id);
    return created!;
}

function buildUpdate(fields: CategoriaUpdate) {
    const entries = Object.entries(fields).filter(([, v]) => v !== undefined);
    if (entries.length === 0) return { sql: "", params: [] as any[] };

    const sets = entries.map(([k]) => `${k} = ?`).join(", ");
    const params = entries.map(([k, v]) =>
        k === "ativo" ? (v ? 1 : 0) : v
    );
    return { sql: sets, params };
}

// export async function updateCategoria(id: number, fields: CategoriaUpdate) {
//     const { sql, params } = buildUpdate(fields);
//     if (!sql) return getCategoriaById(id);

//     await query(`UPDATE categorias SET ${sql} WHERE id = ?`, [...params, id]);
//     return getCategoriaById(id);
// }

export async function updateCategoria(id: number, fields: CategoriaUpdate) {
    const { sql, params } = buildUpdate(fields);
  
    // sempre atualizar data_atualizacao
    const setSql = sql ? `${sql}, data_atualizacao = NOW()` : `data_atualizacao = NOW()`;
  
    await query(`UPDATE categorias SET ${setSql} WHERE id = ?`, [...params, id]);
    return getCategoriaById(id);
} 

export async function deleteCategoria(id: number) {
    const rows = await query<any>(`DELETE FROM categorias WHERE id = ?`, [id]);
    const still = await getCategoriaById(id);
    return !still;
}
