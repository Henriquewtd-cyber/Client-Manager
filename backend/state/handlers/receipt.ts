

// Handler para estado de "Comprovante Enviado" (após usuário enviar comprovante, antes de aceitar ou rejeitar)

// Fluxo esperado:
// 1. O admin aceita ou rejeita o comprovante enviado pelo cliente e acaba aqui ()
// 2. O sistema responde ao cliente com o status do comprovante (aceito, rejeitado ou pendente)
// 3. Se for aceito, o sistema avisa que o comprovante foi aceito e aguarda confirmação de agendamento
// 4. Se for rejeitado, o sistema avisa que o comprovante foi rejeitado e volta para o estado de "Aguardando Pagamento"
// 5. Se for pendente, o sistema avisa que o comprovante está sendo verificado e aguarda próximos passos

import { setSession } from "@/backend/infra/redis";
import { cancelHandler } from "./cancel";
import { sendTextMessage } from "@/backend/infra/waha";
import { STATES } from "../states";

export default async function receiptHandler(data: { msg: any, telefone: string, nome: string, comprovanteStatus: string }): Promise<string> {
    const { msg, telefone, nome, comprovanteStatus } = data;

    if (msg.toLowerCase() === "cancelar") {
        await cancelHandler(telefone);
        return "Consulta cancelada.";
    }

    if (comprovanteStatus === "rejeitado") {
        await sendTextMessage({ telefone: telefone, text: "Infelizmente, o comprovante enviado não foi aceito. Por favor, envie um comprovante válido para que possamos processar seu pagamento ou digite 'cancelar' para cancelar a consulta." });
        setSession(telefone, { estado: STATES.AGUARDANDO_PAGAMENTO, telefone, paymentId: "" });
    }

    else if (comprovanteStatus === "aceito") {
        await sendTextMessage({ telefone: telefone, text: "Comprovante aceito! Entraremos em contato para confirmar o agendamento." });
        setSession(telefone, { estado: STATES.ACEITO, telefone, paymentId: "pago e aceito" });
    }

    else if (comprovanteStatus === "pendente") {
        await sendTextMessage({ telefone: telefone, text: "Olá! Seu comprovante está sendo verificado. Por favor, aguarde enquanto processamos sua solicitação." });
    }

    return "Status do comprovante atualizado. Aguardando próximos passos.";

}