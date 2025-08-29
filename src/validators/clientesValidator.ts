import { z } from "zod";
import { ClienteCreate, ClienteUpdate } from "../domain/clientes";

const base = {
    nome: z.string().min(1).max(255),
    email: z.string().email().max(255),
    telefone: z.string().min(1).max(20),
    ativo: z.number().optional()
};

export const createClienteSchema = z.object(base) as z.ZodType<ClienteCreate>;
export const updateClienteSchema = z.object({
    nome: base.nome.optional(),
    email: base.email.optional(),
    telefone: base.telefone.optional(),
    ativo: base.ativo.optional()
}).refine(o => Object.keys(o).length > 0, { message: "Forneça ao menos um campo" }) as z.ZodType<ClienteUpdate>;
