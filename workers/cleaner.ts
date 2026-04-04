


import { cancelarJobRedis } from "@/app/services/job.service";
import { deletarJob, limparJobsExecutados, atualizarStatusJob, pegarJobsExecutados } from "@/app/services/user.service";

// Este arquivo é reponsável por deletar os jobs no redis e no banco de dados que já foram executados, 
// para evitar acúmulo de jobs antigos e manter o sistema limpo. Ele roda a cada 24 horas para garantir 
// que os jobs antigos sejam removidos regularmente.
// correspondentes na fila de agendamento do Redis.

const INTERVALO = 60 * 1000 * 60; // 1 hora

async function verificarJobs() {
    const jobs = await pegarJobsExecutados();

    for (const job of jobs) {
        await cancelarJobRedis(job.eventId); // Redis
    }

    await limparJobsExecutados(); // db
}

setInterval(verificarJobs, INTERVALO);