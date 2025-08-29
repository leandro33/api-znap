import { Request, Response } from "restify";
import * as svc from "../services/pedidosService";
import { pedidoCreateSchema, pedidoUpdateSchema } from "../validators/pedidosValidator";
import { parsePageQuery } from "../shared/pagination";

export async function list(req: Request, res: Response) {
    const { limit, offset, search } = parsePageQuery(req.query as any);
    const out = await svc.list({ limit, offset, q: search || undefined });
    res.send({ items: out.items, total: out.total });
}

export async function get(req: Request, res: Response) {
    const out = await svc.get(Number(req.params.id));
    res.send(out);
}

export async function create(req: Request, res: Response) {
    const data = pedidoCreateSchema.parse(req.body);
    const out = await svc.create(data);
    res.send(201, out);
}

export async function update(req: Request, res: Response) {
    const data = pedidoUpdateSchema.parse(req.body);
    const out = await svc.update(Number(req.params.id), data);
    res.send(out);
}

export async function remove(req: Request, res: Response) {
    await svc.remove(Number(req.params.id));
    res.send(204);
}
