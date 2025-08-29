import * as repo from "../repositories/categoriasRepository";
import { CategoriaCreate, CategoriaUpdate } from "../domain/categorias";
import { PageOpts } from "../shared/pagination";
import { listCategoriasPaged } from "../repositories/categoriasRepository";

export async function list(p: { limit?: number; offset?: number }) {
    return repo.listCategorias(p);
}

export function searchCategorias(p: {
    nome?: string; descricao?: string; q?: string;
    limit: number; offset: number;
}) {
    return repo.searchCategorias(p);
}

export function listPagedService(opts: PageOpts) {
    return listCategoriasPaged(opts);
}

export async function get(id: number) {
    const c = await repo.getCategoriaById(id);
    if (!c) throw Object.assign(new Error("Categoria não encontrado"), { statusCode: 404 });
    return c;
}

export async function create(data: CategoriaCreate) {
    return repo.createCategoria(data);
}

export async function update(id: number, data: CategoriaUpdate) {
    await get(id);
    return repo.updateCategoria(id, data);
}

export async function remove(id: number) {
    const ok = await repo.deleteCategoria(id);
    if (!ok) throw Object.assign(new Error("Categoria não encontrado"), { statusCode: 404 });
}
