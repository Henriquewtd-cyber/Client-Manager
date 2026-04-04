


//Handler para estado de "Confirmado" (após confirmação de agendamento, antes de atendimento)

//Fluxo esperado:
//1. O cliente pode mandar msg nesse estado, o sistema avisa que a consulta já foi confirmada e que basta aguardar o atendimento.
//2. O sistema pergunta se o cliente deseja cancelar a consulta, caso o cliente responda "cancelar" o sistema cancela a consulta.

import { cancelHandler } from "./cancel";
import { sendTextMessage } from "@/backend/infra/waha";
import { pegarProximoEvento } from "@/app/services/user.service";

export default async function confirmedHandler(data: { msg: any, telefone: string, nome: string }): Promise<string> {
    const { msg, telefone, nome } = data;
    const proximoEvento = await pegarProximoEvento(telefone);

    if (!proximoEvento) {
        return "Nenhuma consulta encontrada para este telefone.";
    }

    const { tipo, start } = proximoEvento;

    await sendTextMessage({ telefone: telefone, text: "Sua consulta de " + tipo + " na data " + start + " já foi confirmada. Aguarde o atendimento, caso queira cancelar, digite 'cancelar'." });

    if (msg.toLowerCase() === "cancelar") {
        await cancelHandler(telefone);
        return "Consulta cancelada.";
    }
    return "Consulta confirmada. Aguardando atendimento.";

}