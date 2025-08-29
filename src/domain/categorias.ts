export interface Categoria {
    id: number;
    nome: string;
    descricao: string;
    ativo: number;
    data_criacao: Date;
    data_atualizacao: Date;
}

export type CategoriaCreate = Omit<Categoria, "id" | "data_criacao" | "data_atualizacao">;
export type CategoriaUpdate = Partial<Omit<Categoria, "id" | "data_criacao" | "data_atualizacao">>;
