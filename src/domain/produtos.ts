export interface Produto {
    id: number;
    nome: string;
    descricao: string;
    categorias_id: number;
    preco: number;
    ativo: number;
    data_criacao: Date;
    data_atualizacao: Date;
}

export type ProdutoCreate = Omit<Produto, "id" | "data_criacao" | "data_atualizacao">;
export type ProdutoUpdate = Partial<Omit<Produto, "id" | "data_criacao" | "data_atualizacao">>;
