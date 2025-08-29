"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateClienteSchema = exports.createClienteSchema = void 0;
const zod_1 = require("zod");
const base = {
    nome: zod_1.z.string().min(1).max(255),
    email: zod_1.z.string().email().max(255),
    telefone: zod_1.z.string().min(1).max(20),
    ativo: zod_1.z.boolean().optional()
};
exports.createClienteSchema = zod_1.z.object(base);
exports.updateClienteSchema = zod_1.z.object({
    nome: base.nome.optional(),
    email: base.email.optional(),
    telefone: base.telefone.optional(),
    ativo: base.ativo.optional()
}).refine(o => Object.keys(o).length > 0, { message: "Forneça ao menos um campo" });
//# sourceMappingURL=clientesValidator.js.map