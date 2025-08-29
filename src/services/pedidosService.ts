import * as repo from "../repositories/pedidosRepository";

export const get    = (id: number) => repo.getPedidoById(id).then(r => r ?? Promise.reject(Object.assign(new Error("Pedido não encontrado"), { statusCode: 404 })));
export const list   = (p: { limit:number; offset:number; q?:string }) => repo.listPedidosPaged(p);
export const create = (d: { cliente_id:number; itens:Array<{produto_id:number; quantidade:number; preco:number}> }) => repo.createPedido(d);
export const update = (id:number, d:{ cliente_id?:number; itens?:Array<{produto_id:number; quantidade:number; preco:number}> }) => repo.updatePedido(id, d);
export const remove = (id:number) => repo.deletePedido(id).then(ok => ok ? undefined : Promise.reject(Object.assign(new Error("Pedido não encontrado"), { statusCode: 404 })));
