import { Request, Response } from "restify";
import * as svc from "../services/relatoriosService";

export async function relatorioPedidos(req: Request, res: Response) {
    const { filtro = {}, page = 1, perPage = 10, colunas = [] } = req.body ?? {};
    const out = await svc.relatorioPedidos({ filtro, page, perPage, colunas });
    res.send({ data: out.items, total: out.total });
}

export async function acClientes(req: Request, res: Response) {
    const term = String((req.query as any)?.term ?? "");
    res.send(await svc.acClientes(term));
}
export async function acProdutos(req: Request, res: Response) {
    const term = String((req.query as any)?.term ?? "");
    res.send(await svc.acProdutos(term));
}
export async function acCategorias(req: Request, res: Response) {
    const term = String((req.query as any)?.term ?? "");
    res.send(await svc.acCategorias(term));
}

export async function relatorioPedidosDetalhes(req: Request, res: Response) {
    const { filtro = {}, page = 1, perPage = 10 } = req.body ?? {};
    const out = await svc.relatorioPedidosDetalhes({ filtro, page, perPage });
    res.send({ data: out.items, total: out.total });
}

