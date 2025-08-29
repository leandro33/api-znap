import { query } from "../config/db";
import { Cliente, ClienteCreate, ClienteUpdate } from "../domain/clientes";
import { listPaged } from "../shared/sql-paging";
import { PageOpts } from "../shared/pagination";

const COLS = "id, nome, email, telefone, ativo, data_criacao, data_atualizacao";
const ORDERABLE = new Set(["id", "nome", "email", "telefone", "ativo", "data_criacao", "data_atualizacao"]);

export async function listClientes({ limit = 50, offset = 0 }) {
    const l = Math.max(1, parseInt(String(limit), 10) || 50);
    const o = Math.max(0, parseInt(String(offset), 10) || 0);
    const sql = `SELECT ${COLS} FROM clientes ORDER BY id LIMIT ${o}, ${l}`;
    const rows = await query<Cliente>(sql);
    return rows;
}

export function listClientesPaged(opts: PageOpts) {
    return listPaged<Cliente>({
        table: "clientes",
        columns: COLS,
        searchable: ["nome", "email", "telefone"],
        orderable: ORDERABLE
    }, opts);
}

export async function searchClientes(p: {
    nome?: string; email?: string; telefone?: string; q?: string;
    limit: number; offset: number;
}): Promise<{ items: Cliente[]; total: number }> {
    const where: string[] = [];
    const params: any[] = [];

    if (p.nome) { where.push("nome LIKE ?"); params.push(`%${p.nome}%`); }
    if (p.email) { where.push("email LIKE ?"); params.push(`%${p.email}%`); }
    if (p.telefone) { where.push("telefone LIKE ?"); params.push(`%${p.telefone}%`); }

    if (p.q) {
        where.push("(nome LIKE ? OR email LIKE ? OR telefone LIKE ?)");
        const s = `%${p.q}%`;
        params.push(s, s, s);
    }

    const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

    const countSql = `SELECT COUNT(*) AS total FROM clientes ${whereSql}`;
    const [{ total = 0 } = { total: 0 }] = await query<{ total: number }>(countSql, params);

    const off = Number.isInteger(p.offset) && p.offset >= 0 ? p.offset : 0;
    const lim = Number.isInteger(p.limit) && p.limit > 0 ? p.limit : 10;

    const dataSql = `SELECT ${COLS} FROM clientes ${whereSql} ORDER BY id ASC LIMIT ${off}, ${lim}`;
    const items = await query<Cliente>(dataSql, params);

    return { items, total };
}

export async function getClienteById(id: number) {
    const rows = await query<Cliente>(`SELECT ${COLS} FROM clientes WHERE id = ?`, [id]);
    return rows[0] ?? null;
}

export async function createCliente(data: ClienteCreate) {
    const { nome, email, telefone, ativo = true } = data;
    const rows = await query<any>(
        `INSERT INTO clientes (nome, email, telefone, ativo) VALUES (?,?,?,?)`,
        [nome, email, telefone, ativo ? 1 : 0]
    );
    const idRow = await query<{ id: number }>(`SELECT LAST_INSERT_ID() AS id`);
    const created = await getClienteById(idRow[0].id);
    return created!;
}

function buildUpdate(fields: ClienteUpdate) {
    const entries = Object.entries(fields).filter(([, v]) => v !== undefined);
    if (entries.length === 0) return { sql: "", params: [] as any[] };

    const sets = entries.map(([k]) => `${k} = ?`).join(", ");
    const params = entries.map(([k, v]) =>
        k === "ativo" ? (v ? 1 : 0) : v
    );
    return { sql: sets, params };
}

// export async function updateCliente(id: number, fields: ClienteUpdate) {
//     const { sql, params } = buildUpdate(fields);
//     if (!sql) return getClienteById(id);

//     await query(`UPDATE clientes SET ${sql} WHERE id = ?`, [...params, id]);
//     return getClienteById(id);
// }

export async function updateCliente(id: number, fields: ClienteUpdate) {
    const { sql, params } = buildUpdate(fields);
  
    // sempre atualizar data_atualizacao
    const setSql = sql ? `${sql}, data_atualizacao = NOW()` : `data_atualizacao = NOW()`;
  
    await query(`UPDATE clientes SET ${setSql} WHERE id = ?`, [...params, id]);
    return getClienteById(id);
} 

export async function deleteCliente(id: number) {
    const rows = await query<any>(`DELETE FROM clientes WHERE id = ?`, [id]);
    const still = await getClienteById(id);
    return !still;
}
