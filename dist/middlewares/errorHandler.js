"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.attachErrorHandler = attachErrorHandler;
function attachErrorHandler(server) {
    server.on("restifyError", (_req, res, err, cb) => {
        const status = err.statusCode ?? 500;
        res.send(status, { error: err.name ?? "Error", message: err.message ?? "Internal error" });
        return cb();
    });
}
//# sourceMappingURL=errorHandler.js.map