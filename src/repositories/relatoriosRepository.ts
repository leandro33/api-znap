import { query } from "../config/db";

type Filtro = { de?: string; ate?: string; clientes_id?: number; categoria_id?: number; produto_id?: number; q?: string };

const COLMAP: Record<string, string> = {
    pedido_id: "pc.id",
    data: "DATE(pc.data_criacao)",
    clientes_id: "pc.clientes_id",
    cliente: "c.nome",
    produto_id: "pp.produtos_id",
    produto: "p.nome",
    categoria_id: "p.categorias_id",
    categoria: "cat.nome"
};
// whitelist padrão para ordenação
const ORDERABLE = new Set(Object.keys(COLMAP));

function buildWhere(f: Filtro, params: any[]) {
    const w: string[] = [];
    if (f.de) { w.push("pc.data_criacao >= ?"); params.push(f.de); }
    if (f.ate) { w.push("pc.data_criacao < DATE_ADD(?, INTERVAL 1 DAY)"); params.push(f.ate); }
    if (f.clientes_id) { w.push("pc.clientes_id = ?"); params.push(f.clientes_id); }
    if (f.categoria_id) { w.push("p.categorias_id = ?"); params.push(f.categoria_id); }
    if (f.produto_id) { w.push("pp.produtos_id = ?"); params.push(f.produto_id); }
    if (f.q) {
        w.push("(c.nome LIKE ? OR p.nome LIKE ? OR cat.nome LIKE ? OR CAST(pc.id AS CHAR) LIKE ?)");
        const s = `%${f.q}%`; params.push(s, s, s, s);
    }
    return w.length ? `WHERE ${w.join(" AND ")}` : "";
}

export async function relatorioPedidos(p: { filtro: Filtro; page: number; perPage: number; colunas: string[] }) {
    const page = Number.isInteger(p.page) && p.page > 0 ? p.page : 1;
    const limit = Number.isInteger(p.perPage) && p.perPage > 0 ? p.perPage : 10;
    const offset = (page - 1) * limit;

    // colunas selecionadas => GROUP BY dinâmico
    const colsSel = (Array.isArray(p.colunas) ? p.colunas : []).filter(c => COLMAP[c]);
    const groupExprs = colsSel.map(c => `${COLMAP[c]} AS ${c}`);
    const groupKeys = colsSel.map(c => COLMAP[c]);

    // métricas
    const METRICS = `
    SUM(pp.quantidade)                            AS quantidade_total,
    SUM(pp.quantidade * pp.preco)                 AS valor_total,
    CASE WHEN SUM(pp.quantidade) > 0
         THEN SUM(pp.quantidade * pp.preco) / SUM(pp.quantidade)
         ELSE 0 END                               AS preco_medio
  `;

    // base FROM + JOINs
    const FROM = `
    FROM pedidos_clientes pc
    JOIN pedidos_produtos pp ON pp.pedidos_clientes_id = pc.id
    JOIN produtos p          ON p.id = pp.produtos_id
    LEFT JOIN clientes c     ON c.id = pc.clientes_id
    LEFT JOIN categorias cat ON cat.id = p.categorias_id
  `;

    const params: any[] = [];
    const whereSql = buildWhere(p.filtro || {}, params);

    // SELECT agrupado
    const selectCols = groupExprs.length ? `${groupExprs.join(", ")}, ${METRICS}` : METRICS;
    const groupBySql = groupKeys.length ? `GROUP BY ${groupKeys.join(", ")}` : "";

    // total de grupos
    const countSql = `SELECT COUNT(*) AS total FROM (
    SELECT 1 ${FROM} ${whereSql} ${groupBySql}
  ) X`;
    const [{ total = 0 } = { total: 0 }] = await query<{ total: number }>(countSql, params);

    // ordenação: por primeira coluna selecionada, senão por valor_total desc
    const orderDefault = groupKeys.length ? `${groupKeys[0]} ASC` : `valor_total DESC`;

    const dataSql = `
    SELECT ${selectCols}
    ${FROM}
    ${whereSql}
    ${groupBySql}
    ORDER BY ${orderDefault}
    LIMIT ${offset}, ${limit}
  `;
    const items = await query<any>(dataSql, params);
    return { items, total };
}

// autocompletes
export async function ac(kind: "clientes" | "produtos" | "categorias", term: string) {
    const s = `%${term || ""}%`;
    if (kind === "clientes") return query(`SELECT id, nome AS label FROM clientes WHERE nome LIKE ? ORDER BY nome LIMIT 0, 20`, [s]);
    if (kind === "produtos") return query(`SELECT id, nome AS label FROM produtos WHERE nome LIKE ? ORDER BY nome LIMIT 0, 20`, [s]);
    return query(`SELECT id, nome AS label FROM categorias WHERE nome LIKE ? ORDER BY nome LIMIT 0, 20`, [s]);
}

// repositories/relatoriosRepository.ts
export async function relatorioPedidosDetalhes(p: { filtro: Filtro; page: number; perPage: number }) {
    const page = Number.isInteger(p.page) && p.page > 0 ? p.page : 1;
    const limit = Number.isInteger(p.perPage) && p.perPage > 0 ? p.perPage : 10;
    const offset = (page - 1) * limit;

    const params: any[] = [];
    const whereSql = buildWhere(p.filtro || {}, params);

    // COUNT total linhas (cada item de pedido)
    const countSql = `
      SELECT COUNT(*) AS total
      FROM pedidos_clientes pc
      JOIN pedidos_produtos pp ON pp.pedidos_clientes_id = pc.id
      JOIN produtos p          ON p.id = pp.produtos_id
      LEFT JOIN clientes c     ON c.id = pc.clientes_id
      LEFT JOIN categorias cat ON cat.id = p.categorias_id
      ${whereSql}
    `;
    const [{ total = 0 } = { total: 0 }] = await query<{ total: number }>(countSql, params);

    // SELECT detalhado
    const dataSql = `
      SELECT
        pc.id                AS pedido_id,
        DATE(pc.data_criacao) AS data_pedido,
        c.nome               AS cliente,
        p.nome               AS produto,
        cat.nome             AS categoria,
        pp.quantidade        AS quantidade,
        pp.preco             AS preco_unitario,
        (pp.quantidade * pp.preco) AS valor_total
      FROM pedidos_clientes pc
      JOIN pedidos_produtos pp ON pp.pedidos_clientes_id = pc.id
      JOIN produtos p          ON p.id = pp.produtos_id
      LEFT JOIN clientes c     ON c.id = pc.clientes_id
      LEFT JOIN categorias cat ON cat.id = p.categorias_id
      ${whereSql}
      ORDER BY pc.id DESC
      LIMIT ${offset}, ${limit}
    `;
    const items = await query<any>(dataSql, params);

    return { items, total };
}



