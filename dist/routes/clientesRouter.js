"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mountClientesRoutes = mountClientesRoutes;
const clientesController_1 = require("../controllers/clientesController");
function mountClientesRoutes(server, prefix = "/clientes") {
    server.get(prefix, clientesController_1.list);
    server.get(`${prefix}/:id`, clientesController_1.get);
    server.post(prefix, clientesController_1.create);
    server.put(`${prefix}/:id`, clientesController_1.update);
    server.del(`${prefix}/:id`, clientesController_1.remove);
}
//# sourceMappingURL=clientesRouter.js.map