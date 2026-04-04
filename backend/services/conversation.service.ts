
// Recebe mensagem, lê estado no Redis e decide qual handler chamar

import { getSession, Session } from "../infra/redis"
import approvedHandler from "../state/handlers/approved";
import awaitingPaymentHandler from "../state/handlers/awaitingPayment";
import confirmedHandler from "../state/handlers/confirmed";
import receiptHandler from "../state/handlers/receipt";
import { STATES } from "../state/states"

export async function handleMessage(data: { message: string; telefone: string, messageType: string, nome: string }) {

    const estado = await getSession(data.telefone).then((session) => {
        console.log('Session data:', session);
        if (!session) {
            console.log('No session found, initializing new session.');
            return 'STATES.AGUARDANDO_PAGAMENTO';
        }

        return session.estado as string
    }).catch((error) => {
        console.error('Error fetching session:', error);
        return 'STATES.AGUARDANDO_PAGAMENTO';
    })


    switch (estado) {
        case STATES.AGUARDANDO_PAGAMENTO:
            await awaitingPaymentHandler({ msg: data.message, msgType: data.messageType, telefone: data.telefone, nome: data.nome });
            break
        case STATES.MANDOU_COMPROVANTE:
            await receiptHandler({ msg: data.message, telefone: data.telefone, nome: data.nome, comprovanteStatus: "Pendente" });
            break
        case STATES.ACEITO:
            await approvedHandler({ msg: data.message, telefone: data.telefone, nome: data.nome });
            break
        case STATES.CONFIRMADO:
            await confirmedHandler({ msg: data.message, telefone: data.telefone, nome: data.nome });
            break
        default:
            await awaitingPaymentHandler({ msg: data.message, msgType: data.messageType, telefone: data.telefone, nome: data.nome });
            break
    }

    return 'Message handled';
}