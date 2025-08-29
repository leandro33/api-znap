import type { Request, Response } from "restify";
import { BadRequestError, NotFoundError } from "restify-errors";
import * as svc from "../services/categoriasService";
import { listPagedService } from "../services/categoriasService";
import { createCategoriaSchema, updateCategoriaSchema } from "../validators/categoriasValidator";
import { handleListPaged } from "../shared/controller-helpers";

export const list = handleListPaged(listPagedService);

export const listNoPaged = async (req: Request, res: Response) => {
    const limit = Number((req.query as any)?.limit);
    const offset = Number((req.query as any)?.offset);
    const safeLimit = Number.isFinite(limit) ? limit : 50;
    const safeOffset = Number.isFinite(offset) ? offset : 0;
    res.send(await svc.list({ limit: safeLimit, offset: safeOffset }));
};

export async function search(req: Request, res: Response) {
    const page = Math.max(1, parseInt(String((req.query as any)?.page ?? 1), 10) || 1);
    const limit = Math.max(1, parseInt(String((req.query as any)?.itemsPerPage ?? 10), 10) || 10);
    const offset = (page - 1) * limit;

    const nome = String((req.query as any)?.nome ?? "").trim();
    const descricao = String((req.query as any)?.descricao ?? "").trim();
    const q = String((req.query as any)?.q ?? "").trim();

    const out = await svc.searchCategorias({ nome, descricao, q, limit, offset });
    res.send({ items: out.items, total: out.total });
}

export const get = async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) throw new BadRequestError("id inválido");
    const item = await svc.get(id);
    if (!item) throw new NotFoundError("categoria não encontrado");
    res.send(200, item);
};

export const create = async (req: Request, res: Response) => {
    const data = createCategoriaSchema.parse(req.body);
    const created = await svc.create(data);
    res.send(201, created);
};

export const update = async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) throw new BadRequestError("id inválido");
    const data = updateCategoriaSchema.parse(req.body);
    const updated = await svc.update(id, data);
    if (!updated) throw new NotFoundError("categoria não encontrado");
    res.send(200, updated);
};

export const remove = async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) throw new BadRequestError("id inválido");
    const removed = await svc.remove(id);
    if (Boolean(removed) === false) throw new NotFoundError("categoria não encontrado");
    res.send(204);
};
