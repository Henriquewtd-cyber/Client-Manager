


import { criarJob } from "@/app/services/user.service";
import { atualizarValidacaodePagamento, buscarValidacoesdePagamentoPendentes } from "@/backend/services/prisma/prisma.service";
import receiptHandler from "@/backend/state/handlers/receipt";


// Get:manda comprovante pro dashbooard do admin para o admin validar ou não o pagamento
export async function GET() {
    try {
        const pagamentosPendentes = await buscarValidacoesdePagamentoPendentes();
        return new Response(JSON.stringify(pagamentosPendentes), {
            status: 200,
            headers: {
                "Content-Type": "application/json",
            },
        });
    }
    catch (error) {
        console.error("Erro ao buscar validações de pagamento pendentes:", error);
        return new Response(JSON.stringify({ error: "Erro ao buscar validações de pagamento pendentes" }), {
            status: 500,
            headers: {
                "Content-Type": "application/json",
            },
        });
    }
}

// Post: recebe o comprovante atualizado do adm, recusado ou aprovado, e atualiza o estado do pagamento no banco de dados
export async function POST(request: Request) {
    try {
        const data = await request.json();

        for (const item of data) {
            await atualizarValidacaodePagamento(item);

            if (item.status === "aprovado") {
                await criarJob({
                    eventId: item.id,
                    telefone: item.telefone,
                    nome: item.nome,
                    dataExecucao: new Date(Date.now() + 5 * 60 * 1000), // executa em 5 minutos
                    tipo: "lembrete",
                });
                await criarJob({
                    eventId: item.id,
                    telefone: item.telefone,
                    nome: item.nome,
                    dataExecucao: new Date(Date.now() + 5 * 60 * 1000), // executa em 5 minutos
                    tipo: "confirmacao",
                });
            }

            if (item.status === "recusado") {
                receiptHandler({ telefone: item.telefone, nome: item.nome, comprovanteStatus: "rejeitado", msg: "cancelar" } as any); // Envia mensagem para o cliente informando que o pagamento foi recusado e volta para o estado de "Aguardando Pagamento"
            }
        }

        return new Response(JSON.stringify({ message: "Validações de pagamento atualizadas com sucesso" }), {
            status: 200,
            headers: {
                "Content-Type": "application/json",
            },
        });
    }
    catch (error) {
        console.error("Erro ao atualizar validação de pagamento:", error);
        return new Response(JSON.stringify({ error: "Erro ao atualizar validação de pagamento" }), {
            status: 500,
            headers: {
                "Content-Type": "application/json",
            },
        });
    }
}












