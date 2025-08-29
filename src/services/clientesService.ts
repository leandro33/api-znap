import * as repo from "../repositories/clientesRepository";
import { ClienteCreate, ClienteUpdate } from "../domain/clientes";
import { PageOpts } from "../shared/pagination";
import { listClientesPaged } from "../repositories/clientesRepository";

export async function list(p: { limit?: number; offset?: number }) {
    return repo.listClientes(p);
}

export function searchClientes(p: {
    nome?: string; email?: string; telefone?: string; q?: string;
    limit: number; offset: number;
}) {
    return repo.searchClientes(p);
}

export function listPagedService(opts: PageOpts) {
    return listClientesPaged(opts);
}

export async function get(id: number) {
    const c = await repo.getClienteById(id);
    if (!c) throw Object.assign(new Error("Cliente não encontrado"), { statusCode: 404 });
    return c;
}

export async function create(data: ClienteCreate) {
    return repo.createCliente(data);
}

export async function update(id: number, data: ClienteUpdate) {
    await get(id);
    return repo.updateCliente(id, data);
}

export async function remove(id: number) {
    const ok = await repo.deleteCliente(id);
    if (!ok) throw Object.assign(new Error("Cliente não encontrado"), { statusCode: 404 });
}
