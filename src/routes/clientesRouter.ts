import { Server } from "restify";
import { list, get, create, update, remove, search } from "../controllers/clientesController";

export function mountClientesRoutes(server: Server, prefix = "/clientes") {
    server.get(prefix, list as never);
    server.get(`${prefix}/:id`, get as never);
    server.get(`${prefix}/search`, search); // /clientes/search?nome=&email=&telefone=&page=1&itemsPerPage=10
    server.post(prefix, create as never);
    server.put(`${prefix}/:id`, update as never);
    server.del(`${prefix}/:id`, remove as never);
}