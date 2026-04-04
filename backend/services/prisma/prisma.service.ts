


// querys para o backend do prisma

import { prisma } from "@/lib/prisma";


// Função para criar um novo registro de validação de pagamento
export async function criarValidacaodePagamento(data: { nome: string, telefone: string, tipoComprovante: string, urlComprovante: string, publicId: string }): Promise<string> {
    try {
        const nome = data.nome;
        const telefone = data.telefone;
        const tipoComprovante = data.tipoComprovante;
        const urlComprovante = data.urlComprovante;
        const publicId = data.publicId;

        const { id } = await prisma.pagamentos.create({
            data: {
                nomeCliente: nome,
                telefone: telefone,
                tipo: tipoComprovante,
                url: urlComprovante,
                publicId: publicId,
                estado: "Pendente"
            },
        });

        return id;
    } catch (error) {
        console.error("Erro ao criar validação de pagamento:", error);
    }
    return "";
}

//Função para buscar as validações de pagamento pendentes (para exibir na dashboard do admin)
export async function buscarValidacoesdePagamentoPendentes(): Promise<{ id: string, nomeCliente: string, telefone: string, tipo: string, url: string, estado: string }[]> {
    try {
        const pagamentos = await prisma.pagamentos.findMany({
            where: {
                estado: "Pendente"
            },
            select: {
                id: true,
                nomeCliente: true,
                telefone: true,
                tipo: true,
                url: true,
                estado: true
            }
        });
        return pagamentos;
    } catch (error) {
        console.error("Erro ao buscar validações de pagamento pendentes:", error);
        return [];
    }
}

//Função para atualizar o estado do pagamento quando o comprovante for enviado
export async function atualizarValidacaodePagamento(data: { id: string, estado: string, url: string, publicId: string, tipo: string }): Promise<{ id: string, estado: string } | null> {
    try {
        const pagamento = await prisma.pagamentos.update({
            where: {
                id: data.id
            },
            data: {
                estado: data.estado,
                url: data.url,
                publicId: data.publicId,
                tipo: data.tipo
            }
        });


    } catch (error) {
        console.error("Erro ao atualizar validação de pagamento:", error);
    }
    return null;
}

// Função para excluir um registro de validação de pagamento (por exemplo, se o cliente cancelar a consulta)
export async function excluirValidacaodePagamento(data: { id: string }): Promise<void> {
    try {
        const id = data.id;
        await prisma.pagamentos.deleteMany({
            where: {
                id: id,
            }
        });
    } catch (error) {
        console.error("Erro ao excluir validação de pagamento:", error);
    }
}