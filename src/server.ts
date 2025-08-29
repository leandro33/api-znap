import * as dotenv from 'dotenv';
dotenv.config();

import * as restify from 'restify';
import { mountClientesRoutes } from "./routes/clientesRouter";
import { mountCategoriasRoutes } from "./routes/categoriasRouter";
import { mountProdutosRoutes } from "./routes/produtosRouter";
import { mountPedidosRoutes } from "./routes/pedidosRouter";
import { mountRelatoriosRoutes } from "./routes/relatoriosRouter";
import { attachErrorHandler } from "./middlewares/errorHandler";
import { httpLogger, bindAppLogger } from "./httpLogging";
import { appLogger } from "./logger";
import cors from "restify-cors-middleware2";

const server = restify.createServer({ name: 'api', version: '1.0.0' });
server.use(httpLogger as never);
server.use(bindAppLogger());

server.use(restify.plugins.acceptParser(server.acceptable));

server.use(restify.plugins.queryParser());
server.use(restify.plugins.bodyParser({ mapParams: false }));

const corsMw = cors({
    origins: [process.env.CORS_ORIGIN || "*"],
    allowHeaders: ["Authorization", "Content-Type"],
    exposeHeaders: []
});

server.pre(corsMw.preflight);
server.use(corsMw.actual);

attachErrorHandler(server);
mountClientesRoutes(server);
mountCategoriasRoutes(server);
mountProdutosRoutes(server);
mountPedidosRoutes(server);
mountRelatoriosRoutes(server);

server.get('/', async (_req, res) => {
    res.send({ ok: true, message: 'znap api running' });
});

const PORT = Number(process.env.PORT || 3000);
server.listen(PORT, () => appLogger.info({ port: server.address().port }, "server up"));
