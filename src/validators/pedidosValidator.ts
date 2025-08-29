import { z } from "zod";

export const pedidoItemSchema = z.object({
  produto_id: z.coerce.number().int().positive(),
  quantidade: z.coerce.number().int().positive(),
  preco: z.coerce.number().finite(),
});

export const pedidoCreateSchema = z.object({
  cliente_id: z.coerce.number().int().positive(),
  itens: z.array(pedidoItemSchema).min(1),
});

export const pedidoUpdateSchema = z.object({
  cliente_id: z.coerce.number().int().positive().optional(),
  itens: z.array(pedidoItemSchema).min(1).optional(),
}).refine(d => Object.keys(d).length > 0, { message: "Nada para atualizar" });