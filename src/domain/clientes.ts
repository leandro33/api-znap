export interface Cliente {
    id: number;
    nome: string;
    email: string;
    telefone: string;
    ativo: number;
    data_criacao: Date;
    data_atualizacao: Date;
}

export type ClienteCreate = Omit<Cliente, "id" | "data_criacao" | "data_atualizacao">;
export type ClienteUpdate = Partial<Omit<Cliente, "id" | "data_criacao" | "data_atualizacao">>;
