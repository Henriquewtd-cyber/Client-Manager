//arquivo que organiza os serviços relacionados aos jobs da fila de agendamento

import { delay } from "bullmq";
import { appointmentQueue } from "./queue.service";
import dayjs from "dayjs";

async function calcularDataConfirmacao(agendamento: Date) { //função para calcular a data de confirmação do agendamento, que é 1 dia antes do agendamento
    const dataConfirmacao = dayjs(agendamento)
        .subtract(1, "day")
        .hour(15)
        .minute(0)
        .second(0)
        .millisecond(0)
        .toDate();
    return dataConfirmacao;
}

export async function criarConfirmarJobRedis(id: string, agendamento: Date, telefone: string, nome: string) { //recebe o Id para criar o job de confirmação da fila de agendamento

    const dataConfirmacao = await calcularDataConfirmacao(agendamento);

    const targetDate = dataConfirmacao.getTime();
    const now = Date.now();

    const delay = Math.max(targetDate - now, 0);

    await appointmentQueue.add(
        "confirmacao",
        { appointmentId: id, telefone: telefone, nome: nome },
        {
            jobId: `confirmacao:${id}`,
            delay: delay, // 18 do dia anterior ao agendamento
        }
    );

}

export async function criarLembreteJobRedis(id: string, agendamento: Date, telefone: string, nome: string) { //recebe o Id para criar o job de lembrete da fila de agendamento

    const dataConfirmacao = await calcularDataConfirmacao(agendamento);

    const targetDate = dataConfirmacao.getTime();
    const now = Date.now();

    const delay = Math.max(targetDate - now, 0);

    await appointmentQueue.add(
        "lembrete",
        { appointmentId: id, telefone: telefone, nome: nome },
        {
            jobId: `lembrete:${id}`,
            delay: delay + 13 * 60 * 60 * 1000, // 7 horas do dia do agendamento
        }
    );
}

export async function cancelarJobRedis(id: string) {
    const confirmacao = await appointmentQueue.getJob(`confirmacao:${id}`);
    const lembrete = await appointmentQueue.getJob(`lembrete:${id}`);

    if (confirmacao) await confirmacao.remove();
    if (lembrete) await lembrete.remove();
}