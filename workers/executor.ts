// arquivo para manuseio dos jobs da fila de agendamento

import { Worker } from "bullmq";
import { enviarConfirmacaoN8N, enviarLembreteN8N } from "../app/services/job.handler";
import dotenv from "dotenv";

dotenv.config();

const worker = new Worker(
    "appointments",
    async job => {
        switch (job.name) {
            case "confirmacao":
                job.data.service = "confirmar";
                return enviarConfirmacaoN8N(job.data);

            case "lembrete":
                job.data.service = "lembrete";
                return enviarLembreteN8N(job.data);
        }
    },
    {
        connection: {
            host: process.env.REDIS_HOST,
            password: process.env.REDIS_PASSWORD,
            port: Number(process.env.REDIS_PORT),
        },
    }
);