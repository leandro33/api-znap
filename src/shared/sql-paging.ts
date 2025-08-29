import { query } from "../config/db";
import { PageOpts, Sort } from "./pagination";

type ListConfig<T> = {
    table: string;
    columns: string;                  // ex: "id, nome, email"
    searchable?: string[];            // ex: ["nome","email"]
    orderable?: Set<string>;          // ex: new Set(["id","nome","email"])
    // where extra fixo opcional
    baseWhere?: string;               // ex: "ativo = 1"
    // binders extras para baseWhere
    baseParams?: any[];
    // mapeamento opcional de linhas
    mapRow?: (r: any) => T;
};

function buildWhere(search: string, searchable: string[] | undefined, baseWhere?: string) {
    const parts: string[] = [];
    const params: any[] = [];
    if (baseWhere) parts.push(`(${baseWhere})`);
    if (search && searchable?.length) {
        const like = `%${search}%`;
        parts.push("(" + searchable.map(c => `${c} LIKE ?`).join(" OR ") + ")");
        for (let i = 0; i < searchable.length; i++) params.push(like);
    }
    return { whereSql: parts.length ? `WHERE ${parts.join(" AND ")}` : "", params };
}

function buildOrder(sort: Sort | undefined, orderable?: Set<string>, fallback = "id ASC") {
    if (!sort) return `ORDER BY ${fallback}`;
    if (orderable?.has(sort.key)) return `ORDER BY ${sort.key} ${sort.order === "desc" ? "DESC" : "ASC"}`;
    return `ORDER BY ${fallback}`;
}

export async function listPaged<T>(
    cfg: ListConfig<T>,
    opts: PageOpts
): Promise<{ items: T[]; total: number }> {
    const { table, columns, searchable, orderable, baseWhere, baseParams = [], mapRow } = cfg;
    const { search, sort, offset, limit } = opts;

    const { whereSql, params: searchParams } = buildWhere(search, searchable, baseWhere);
    const orderSql = buildOrder(sort, orderable);

    const safeOffset = Number.isInteger(offset) && offset >= 0 ? offset : 0;
    const safeLimit  = Number.isInteger(limit)  && limit  > 0 ? limit  : 10;

    const dataSql = `SELECT ${columns} FROM ${table} ${whereSql} ${orderSql} LIMIT ${safeOffset}, ${safeLimit}`;
    const items = await query<any>(dataSql, [...baseParams, ...searchParams]);

    const countSql = `SELECT COUNT(*) AS total FROM ${table} ${whereSql}`;
    const totalRow = await query<{ total: number }>(countSql, [...baseParams, ...searchParams]);

    const total = totalRow[0]?.total ?? 0;

    return { items: (mapRow ? items.map(mapRow) : items) as T[], total };
}
