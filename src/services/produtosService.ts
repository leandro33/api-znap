import * as repo from "../repositories/produtosRepository";
import { ProdutoCreate, ProdutoUpdate } from "../domain/produtos";
import { PageOpts } from "../shared/pagination";
import { listProdutosPaged } from "../repositories/produtosRepository";

export async function list(p: { limit?: number; offset?: number }) {
    return repo.listProdutos(p);
}

export function searchProdutos(p: {
    nome?: string; descricao?: string; categorias_id?: number; preco?: number; q?: string;
    limit: number; offset: number;
}) {
    return repo.searchProdutos(p);
}

export function listPagedService(opts: PageOpts) {
    return listProdutosPaged(opts);
}

export async function get(id: number) {
    const c = await repo.getProdutoById(id);
    if (!c) throw Object.assign(new Error("Produto não encontrado"), { statusCode: 404 });
    return c;
}

export async function create(data: ProdutoCreate) {
    return repo.createProduto(data);
}

export async function update(id: number, data: ProdutoUpdate) {
    await get(id);
    return repo.updateProduto(id, data);
}

export async function remove(id: number) {
    const ok = await repo.deleteProduto(id);
    if (!ok) throw Object.assign(new Error("Produto não encontrado"), { statusCode: 404 });
}
