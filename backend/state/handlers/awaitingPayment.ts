

// Handler para estado de "Aguardando Pagamento" (após solicitar pagamento, antes de receber comprovante)

// O fluxo esperado é:
// 1. O cliente é instruído a realizar o pagamento e enviar o comprovante
// 2. O cliente envia um comprovante (pdf ou imagem) ou digita "cancelar"
// 3. Se for um comprovante, o sistema salva a informação e aguarda confirmação de pagamento
// 4. Se for "cancelar", o sistema cancela a consulta e limpa os dados relacionados

import { cancelHandler } from "./cancel";
import { atualizarValidacaodePagamento, criarValidacaodePagamento } from "@/backend/services/prisma/prisma.service";
import { setSession } from "@/backend/infra/redis";
import { sendTextMessage } from "@/backend/infra/waha";
import { STATES } from "../states";
import { uploadComprovante } from "@/backend/services/cloudinary.service";


export default async function awaitingPaymentHandler(data: { msg: any, msgType: string, telefone: string, nome: string }): Promise<string> {
    const { msg, msgType, telefone, nome } = data;

    const paymentId = await criarValidacaodePagamento({ nome: nome, telefone: telefone, tipoComprovante: "", urlComprovante: "", publicId: "" }); // Cria registro de pagamento no banco e obtém o ID

    setSession(telefone, { estado: STATES.AGUARDANDO_PAGAMENTO, telefone, paymentId });

    if (msg.toLowerCase() === "cancelar") {
        await cancelHandler(telefone);
        return "Consulta cancelada. Se precisar de algo mais, é só chamar!";
    }

    if (msgType == "pdf" || msgType == "image") {
        const file = msgType === "pdf" ? await msg.getFile() : await msg.getFile(); // Supondo que ambos os tipos de mensagem tenham o método getFile para obter o arquivo

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const { url: cloud_url, public_id: publicId } = await uploadComprovante(buffer);

        await setSession(telefone, { estado: STATES.MANDOU_COMPROVANTE, telefone, paymentId }); // Salva o ID do pagamento na sessão do usuário para futuras referências
        await atualizarValidacaodePagamento({ id: paymentId, estado: "Comprovante Enviado", url: cloud_url, publicId: publicId, tipo: msgType }); // Atualiza o estado do pagamento para refletir que o comprovante foi enviado
        await sendTextMessage({ telefone: telefone, text: "Comprovante recebido. Entraremos em contato para confirmar o agendamento." });

        return "Comprovante recebido. Aguardando confirmação de pagamento.";
    }

    return "Mensagem não reconhecida. Por favor, envie um comprovante de pagamento ou digite 'cancelar'.";
}
