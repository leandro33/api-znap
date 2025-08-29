import * as repo from "../repositories/relatoriosRepository";

export function relatorioPedidos(p: {
    filtro: { de?: string; ate?: string; cliente_id?: number; categoria_id?: number; produto_id?: number; q?: string };
    page: number; perPage: number; colunas: string[];
}) { return repo.relatorioPedidos(p); }

export const acClientes = (t: string) => repo.ac("clientes", t);
export const acProdutos = (t: string) => repo.ac("produtos", t);
export const acCategorias = (t: string) => repo.ac("categorias", t);

export const relatorioPedidosDetalhes = (p: {
    filtro: { de?: string; ate?: string; cliente_id?: number; categoria_id?: number; produto_id?: number; q?: string };
    page: number; perPage: number;
}) => repo.relatorioPedidosDetalhes(p);

