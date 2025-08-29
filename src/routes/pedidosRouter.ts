import { Server } from "restify";
import { list, get, create, update, remove } from "../controllers/pedidosController";

export function mountPedidosRoutes(server: Server, prefix = "/pedidos") {
  server.get(prefix, list);
  server.get(`${prefix}/:id`, get);
  server.post(prefix, create);
  server.put(`${prefix}/:id`, update);
  server.del(`${prefix}/:id`, remove);
}
