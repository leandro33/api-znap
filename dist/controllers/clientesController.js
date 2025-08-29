"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.list = list;
exports.get = get;
exports.create = create;
exports.update = update;
exports.remove = remove;
const svc = __importStar(require("../services/clientesService"));
const clientesValidator_1 = require("../validators/clientesValidator");
async function list(req, res) {
    const items = await svc.list(req.body);
    res.send(200, items);
}
async function get(req, res, next) {
    try {
        res.send(await svc.get(Number(req.params.id)));
        return next();
    }
    catch (e) {
        return next(e);
    }
}
async function create(req, res, next) {
    try {
        const data = clientesValidator_1.createClienteSchema.parse(req.body);
        res.send(201, await svc.create(data));
        return next();
    }
    catch (e) {
        return next(e);
    }
}
async function update(req, res, next) {
    try {
        const data = clientesValidator_1.updateClienteSchema.parse(req.body);
        res.send(await svc.update(Number(req.params.id), data));
        return next();
    }
    catch (e) {
        return next(e);
    }
}
async function remove(req, res, next) {
    try {
        await svc.remove(Number(req.params.id));
        res.send(204);
        return next();
    }
    catch (e) {
        return next(e);
    }
}
//# sourceMappingURL=clientesController.js.map