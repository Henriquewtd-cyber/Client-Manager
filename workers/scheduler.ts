

// workers/scheduler.ts
// Este arquivo é responsável por verificar periodicamente os jobs pendentes no banco de dados e criar os jobs 
// correspondentes na fila de agendamento do Redis.


import { atualizarStatusJob, pegarJobsPendentes } from "@/app/services/user.service";
import { criarLembreteJobRedis, criarConfirmarJobRedis } from "@/app/services/job.service";

const INTERVALO = 60 * 1000 * 60; // 1 hora

async function verificarJobs() {
    const jobs = await pegarJobsPendentes();

    for (const job of jobs) {

        if (job.tipo === "confirmacao") {
            await criarConfirmarJobRedis(job.eventId, job.dataExec, job.telefone, job.nome);
        }
        if (job.tipo === "lembrete") {
            await criarLembreteJobRedis(job.eventId, job.dataExec, job.telefone, job.nome);
        }

        await atualizarStatusJob(job.id, "agendado no redis");

    }


}

setInterval(verificarJobs, INTERVALO);