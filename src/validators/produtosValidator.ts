import { z } from "zod";
import { ProdutoCreate, ProdutoUpdate } from "../domain/produtos";

const base = {
    nome: z.string().min(3).max(255),
    descricao: z.string().min(1).max(50),
    categorias_id: z.number(),
    preco: z.number(),
    ativo: z.number().optional()
};

export const createProdutoSchema = z.object(base) as z.ZodType<ProdutoCreate>;
export const updateProdutoSchema = z.object({
    nome: base.nome.optional(),
    descricao: base.descricao.optional(),
    categorias_id: base.categorias_id.optional(),
    preco: base.preco.optional(),
    ativo: base.ativo.optional()
}).refine(o => Object.keys(o).length > 0, { message: "Forneça ao menos um campo" }) as z.ZodType<ProdutoUpdate>;
