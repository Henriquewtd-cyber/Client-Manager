


// Handler para estado de "Aprovado" (após aceitar comprovante, antes de confirmar agendamento)

// Fluxo esperado:
// 1. Se o cliente mandar msg nesse estado o sistema avisa que a consulta já foi aprovada e que basta aguardar a confirmação de agendamento.
// 2. O sistema pergunta se o cliente deseja cancelar a consulta, caso o cliente responda "cancelar" o sistema cancela a consulta.

import { cancelHandler } from "./cancel";
import { sendTextMessage } from "@/backend/infra/waha";
import { pegarProximoEvento } from "@/app/services/user.service";

export default async function approvedHandler(data: { msg: any, telefone: string, nome: string }): Promise<string> {
    const { msg, telefone, nome } = data;
    const proximoEvento = await pegarProximoEvento(telefone);

    if (!proximoEvento) {
        return "Nenhuma consulta encontrada para este telefone.";
    }

    const { tipo, start } = proximoEvento;

    await sendTextMessage({ telefone: telefone, text: "Sua consulta de " + tipo + "  na data " + start + " já foi aprovada. Aguarde a confirmação de agendamento, caso queira cancelar, digite 'cancelar'." });

    if (msg.toLowerCase() === "cancelar") {
        await cancelHandler(telefone);
        return "Consulta cancelada.";
    }
    return "Consulta aprovada. Aguardando confirmação de agendamento.";

}