import { Server } from "restify";
import { list, get, create, update, remove, search } from "../controllers/categoriasController";

export function mountCategoriasRoutes(server: Server, prefix = "/categorias") {
    server.get(prefix, list as never);
    server.get(`${prefix}/:id`, get as never);
    server.get(`${prefix}/search`, search); // /categorias/search?nome=&descricao=&page=1&itemsPerPage=10
    server.post(prefix, create as never);
    server.put(`${prefix}/:id`, update as never);
    server.del(`${prefix}/:id`, remove as never);
}