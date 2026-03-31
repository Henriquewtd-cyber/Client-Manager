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

export async function criarConfirmarJob(id: string, agendamento: Date, telefone: string, nome: string) { //recebe o Id para criar o job de confirmação da fila de agendamento

    const dataConfirmacao = await calcularDataConfirmacao(agendamento);

    const targetDate = dataConfirmacao.getTime();
    const now = Date.now();

    const delay = targetDate - now;
    await appointmentQueue.add(
        "confirmacao",
        { appointmentId: id, telefone: telefone, nome: nome },
        {
            delay: 10, // 18 do dia anterior ao agendamento
        }
    );

}

export async function criarLembreteJob(id: string, agendamento: Date, telefone: string, nome: string) { //recebe o Id para criar o job de lembrete da fila de agendamento

    const dataConfirmacao = await calcularDataConfirmacao(agendamento);

    const targetDate = dataConfirmacao.getTime();
    const now = Date.now();

    const delay = targetDate - now;

    await appointmentQueue.add(
        "lembrete",
        { appointmentId: id, telefone: telefone, nome: nome },
        {
            delay: delay, // 18 do dia anterior ao agendamento
        }
    );
}

export async function CriarcancelarJob(id: string) { //recebe o Id para cancelar o job da fila de agendamento

    if (id) {
        const job = await appointmentQueue.getJob(id);

        if (job) {
            await job.remove();
        }
    }

}