"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listClientes = listClientes;
exports.getClienteById = getClienteById;
exports.createCliente = createCliente;
exports.updateCliente = updateCliente;
exports.deleteCliente = deleteCliente;
const db_1 = require("../config/db");
const COLS = `id, nome, email, telefone, ativo, data_criacao, data_atualizacao`;
async function listClientes(params) {
    const { limit = 50, offset = 0 } = params;
    const sql = `SELECT ${COLS} FROM clientes ORDER BY id LIMIT $1 OFFSET $2`;
    const { rows } = await (0, db_1.query)(sql, [limit, offset]);
    return rows;
}
async function getClienteById(id) {
    const { rows } = await (0, db_1.query)(`SELECT ${COLS} FROM clientes WHERE id = $1`, [id]);
    return rows[0] ?? null;
}
async function createCliente(data) {
    const { nome, email, telefone, ativo = true } = data;
    const { rows } = await (0, db_1.query)(`INSERT INTO clientes (nome, email, telefone, ativo, data_criacao, data_atualizacao)
     VALUES ($1,$2,$3,$4,NOW(),NOW())
     RETURNING ${COLS}`, [nome, email, telefone, ativo]);
    return rows[0];
}
async function updateCliente(id, fields) {
    const keys = Object.keys(fields);
    if (keys.length === 0)
        return getClienteById(id);
    const sets = keys.map((k, i) => `${String(k)} = $${i + 1}`).join(", ");
    const values = keys.map(k => fields[k]);
    values.push(id);
    const sql = `
    UPDATE clientes SET ${sets}, data_atualizacao = NOW()
    WHERE id = $${values.length}
    RETURNING ${COLS}
  `;
    const { rows } = await (0, db_1.query)(sql, values);
    return rows[0] ?? null;
}
async function deleteCliente(id) {
    const { rowCount } = await (0, db_1.query)(`DELETE FROM clientes WHERE id = $1`, [id]);
    return rowCount > 0;
}
//# sourceMappingURL=clientesRepository.js.map