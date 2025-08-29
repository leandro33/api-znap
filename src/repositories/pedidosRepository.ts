import mysql from "mysql2/promise";
import { pool } from "../config/db";
import { query } from "../config/db";

export type PedidoHeader = { id: number; cliente_id: number; data_criacao: Date; data_atualizacao: Date };
export type PedidoItem = { id: number; pedidos_clientes_id: number; produtos_id: number; quantidade: number; preco: number };
export type PedidoFull = PedidoHeader & { itens: Array<{ id: number; produtos_id: number; nome: string; quantidade: number; preco: number }> };

export async function getPedidoById(id: number): Promise<PedidoFull | null> {
    const [h] = await query<PedidoHeader>(`SELECT id,clientes_id,data_criacao,data_atualizacao FROM pedidos_clientes WHERE id = ?`, [id]);
    if (!h) return null;
    const itens = await query<any>(`
      SELECT i.id, i.produtos_id, p.nome, i.quantidade, i.preco
      FROM pedidos_produtos i
      JOIN produtos p ON p.id = i.produtos_id
      WHERE i.pedidos_clientes_id = ?`, [id]);
    return { ...h, itens };
}

export async function listPedidosPaged(opts: { limit: number; offset: number; q?: string }) {
    const where: string[] = [];
    const params: any[] = [];

    if (opts.q) {
        where.push("(CAST(pc.id AS CHAR) LIKE ? OR CAST(pc.clientes_id AS CHAR) LIKE ?)");
        const s = `%${opts.q}%`;
        params.push(s, s);
    }

    const w = where.length ? `WHERE ${where.join(" AND ")}` : "";
    const [{ total = 0 } = { total: 0 }] = await query<{ total: number }>(
        `SELECT COUNT(*) total FROM pedidos_clientes pc ${w}`, params);

    const off = Number.isInteger(opts.offset) && opts.offset >= 0 ? opts.offset : 0;
    const lim = Number.isInteger(opts.limit) && opts.limit > 0 ? opts.limit : 10;

    const rows = await query<PedidoFull>(`
    SELECT pc.id, pc.clientes_id, pc.data_criacao, pc.data_atualizacao
    FROM pedidos_clientes pc
    ${w}
    ORDER BY pc.id DESC
    LIMIT ${off}, ${lim}`, params);

    // opcional: trazer itens resumidos por pedido
    return { items: rows, total };
}

// export async function createPedido(input: { cliente_id: number; itens: Array<{ produto_id: number; quantidade: number; preco: number }> }): Promise<PedidoFull> {
//     const conn = await pool.getConnection();
//     try {
//         await conn.beginTransaction();

//         const [r1] = await conn.execute<mysql.ResultSetHeader>(
//             `INSERT INTO pedidos_clientes (clientes_id) VALUES (?)`, [input.cliente_id]);
//         const pedidoId = r1.insertId;

//         const values: any[] = [];
//         const placeholders: string[] = [];
//         for (const it of input.itens) {
//             placeholders.push("(?,?,?,?,NOW(),NOW())");
//             values.push(pedidoId, it.produto_id, it.quantidade, it.preco);
//         }
//         await conn.execute(
//             `INSERT INTO pedidos_produtos (pedidos_clientes_id, produtos_id, quantidade, preco, data_criacao, data_atualizacao)
//        VALUES ${placeholders.join(",")}`, values);

//         await conn.commit();
//         const full = await getPedidoById(pedidoId);
//         // @ts-ignore
//         return full!;
//     } catch (e) {
//         await conn.rollback();
//         throw e;
//     } finally {
//         conn.release();
//     }
// }

export async function createPedido(input: { cliente_id: number; itens: Array<{ produto_id: number; quantidade: number; preco: number }> }): Promise<PedidoFull> {
    const conn = await pool.getConnection();
    try {
        await conn.beginTransaction();

        // cria pedido sem numero ainda
        const [r1] = await conn.execute<mysql.ResultSetHeader>(
            `INSERT INTO pedidos_clientes (clientes_id) VALUES (?)`,
            [input.cliente_id]
        );
        const pedidoId = r1.insertId;

        // gerar numero: idPedido * 100
        let numero = String(0);

        // atualizar campo numero
        await conn.execute(
            `UPDATE pedidos_clientes SET numero = ? WHERE id = ?`,
            [numero, pedidoId]
        );

        const values: any[] = [];
        const placeholders: string[] = [];
        for (const it of input.itens) {
            placeholders.push("(?,?,?,?,NOW(),NOW())");
            values.push(pedidoId, it.produto_id, it.quantidade, it.preco);
            numero = String(it.produto_id * 100 + pedidoId);
        }
        await conn.execute(
            `INSERT INTO pedidos_produtos (pedidos_clientes_id, produtos_id, quantidade, preco, data_criacao, data_atualizacao)
         VALUES ${placeholders.join(",")}`,
            values
        );

        await conn.commit();
        const full = await getPedidoById(pedidoId);
        // @ts-ignore
        return full!;
    } catch (e) {
        await conn.rollback();
        throw e;
    } finally {
        conn.release();
    }
}


export async function updatePedido(id: number, input: { cliente_id?: number; itens?: Array<{ produto_id: number; quantidade: number; preco: number }> }): Promise<PedidoFull> {
    const conn = await pool.getConnection();
    try {
        await conn.beginTransaction();

        if (input.cliente_id !== undefined) {
            await conn.execute(`UPDATE pedidos_clientes SET cliente_id = ? WHERE id = ?`, [input.cliente_id, id]);
        }

        if (input.itens) {
            await conn.execute(`DELETE FROM pedidos_produtos WHERE pedidos_clientes_id = ?`, [id]);
            if (input.itens.length) {
                const values: any[] = [];
                const placeholders: string[] = [];
                for (const it of input.itens) {
                    placeholders.push("(?,?,?,?,NOW(),NOW())");
                    values.push(id, it.produto_id, it.quantidade, it.preco);
                }
                await conn.execute(
                    `INSERT INTO pedidos_produtos (pedidos_clientes_id, produtos_id, quantidade, preco, data_criacao, data_atualizacao)
           VALUES ${placeholders.join(",")}`, values);
            }
        }

        await conn.commit();
        const full = await getPedidoById(id);
        // @ts-ignore
        return full!;
    } catch (e) {
        await conn.rollback();
        throw e;
    } finally {
        conn.release();
    }
}

export async function deletePedido(id: number) {
    // ON DELETE CASCADE nos itens cuida deles
    await query(`DELETE FROM pedidos_clientes WHERE id = ?`, [id]);
    const [still] = await query(`SELECT 1 FROM pedidos_clientes WHERE id = ?`, [id]);
    return !still;
}
