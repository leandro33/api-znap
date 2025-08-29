export type Sort = { key: string; order: "asc" | "desc" };
export type PageQuery = {
    page?: number | string;
    itemsPerPage?: number | string;
    search?: string;
    sortBy?: Sort[] | string;
};

export type PageOpts = {
    page: number;
    limit: number;
    offset: number;
    search: string;
    sort?: Sort;
};

export function parsePageQuery(q: PageQuery): PageOpts {
    // suporte a page/itemsPerPage e limit/offset
    const limitRaw  = q.itemsPerPage ?? (q as any).limit;
    const offsetRaw = (q as any).offset;
  
    const page = Math.max(1, parseInt(String(q.page ?? 1), 10) || 1);
    const limit = Math.max(1, parseInt(String(limitRaw ?? 10), 10) || 10);
  
    // se offset foi passado, derive page a partir dele
    let offset = parseInt(String(offsetRaw ?? (page - 1) * limit), 10);
    offset = Number.isInteger(offset) && offset >= 0 ? offset : (page - 1) * limit;
  
    let sort: Sort | undefined;
    if (q.sortBy) {
      try {
        const arr = Array.isArray(q.sortBy) ? q.sortBy : JSON.parse(String(q.sortBy));
        if (arr?.length) sort = { key: String(arr[0].key || ""), order: arr[0].order === "desc" ? "desc" : "asc" };
      } catch {}
    }
    return { page, limit, offset, search: String(q.search ?? "").trim(), sort };
  }
  
