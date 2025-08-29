import { Server } from "restify";
import { relatorioPedidos, acClientes, acProdutos, acCategorias } from "../controllers/relatoriosController";
import { relatorioPedidosDetalhes } from "../controllers/relatoriosController";

export function mountRelatoriosRoutes(server: Server, prefix = "/relatorios") {
    server.post(`${prefix}/pedidos`, relatorioPedidos);
    server.post(`${prefix}/pedidos/detalhes`, relatorioPedidosDetalhes);
    server.get(`${prefix}/ac/clientes`, acClientes);
    server.get(`${prefix}/ac/produtos`, acProdutos);
    server.get(`${prefix}/ac/categorias`, acCategorias);
}
