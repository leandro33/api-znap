import { z } from "zod";
import { CategoriaCreate, CategoriaUpdate } from "../domain/categorias";

const base = {
    nome: z.string().min(1).max(255),
    descricao: z.string().min(1).max(50),
    ativo: z.number().optional()
};

export const createCategoriaSchema = z.object(base) as z.ZodType<CategoriaCreate>;
export const updateCategoriaSchema = z.object({
    nome: base.nome.optional(),
    descricao: base.descricao.optional(),
    ativo: base.ativo.optional()
}).refine(o => Object.keys(o).length > 0, { message: "Forneça ao menos um campo" }) as z.ZodType<CategoriaUpdate>;
