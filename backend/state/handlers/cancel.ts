

// Handler para cancelar consulta
// O fluxo esperado é:
// 1. O cliente digita "cancelar".
// 2. O sistema deleta a sessão do usuário e .
// 3. O sistema responde com uma mensagem de confirmação de cancelamento.

import { atualizarValidacaodePagamento } from "@/backend/services/prisma/prisma.service";
import { getSession, deleteSession } from "@/backend/infra/redis";
import { sendTextMessage } from "@/backend/infra/waha";

export async function cancelHandler(telefone: string): Promise<string> {
    const session = await getSession(telefone);
    const paymentId = session?.paymentId;

    if (!paymentId) {
        throw new Error("Payment ID not found in session");
    }

    await atualizarValidacaodePagamento({ id: paymentId, estado: "Cancelado", url: "", publicId: "", tipo: "" }); // Atualiza o estado do pagamento para "Cancelado"
    await deleteSession(telefone); // Limpa a sessão do usuário após o cancelamento
    await sendTextMessage({ telefone: telefone, text: "Consulta cancelada. Caso deseje agendar novamente, use o link: [link]" });

    return "Consulta cancelada. Se precisar de algo mais, é só chamar!";
}