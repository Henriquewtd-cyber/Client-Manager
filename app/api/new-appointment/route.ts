
import { NextResponse } from "next/server";
import { criarEvento, pegarTodosEventos } from "@/app/services/user.service";
import { criarConfirmarJob, criarLembreteJob } from "@/app/services/job.service";

export async function POST(request: Request) {

    const { slots, total, service, dados, duration } = await request.json();

    try {
        for (const slot of slots) {
            const baseDate = new Date(slot.date);

            const [hours, minutes] = slot.time.split(":");

            baseDate.setUTCHours(Number(hours));
            baseDate.setUTCMinutes(Number(minutes));
            baseDate.setUTCSeconds(0);
            baseDate.setUTCMilliseconds(0);

            const startDate = baseDate.toISOString();

            if (duration + Number(minutes) >= 60) {
                baseDate.setUTCHours(Number(hours) + 1);
                baseDate.setUTCMinutes((Number(minutes) + duration) % 60);
            } else {
                baseDate.setUTCMinutes((Number(minutes) + duration));
            }

            baseDate.setUTCSeconds(0);
            baseDate.setUTCMilliseconds(0);

            const finalDate = baseDate.toISOString();

            const data: any = {
                title: service,
                nomeCliente: dados.nome,
                telefone: dados.telefone,
                start: startDate,
                end: finalDate,
                description: dados.descricao,
                status: "Pendente",
            };

            const evento = await criarEvento(data);

            if (!evento) {
                throw new Error("Nenhum evento encontrado");
            }

            Promise.allSettled([
                criarConfirmarJob(evento.id, data.start, dados.telefone, dados.nome),
                criarLembreteJob(evento.id, data.start, dados.telefone, dados.nome),
            ]);
        }

        const response = NextResponse.json({
            ok: true,
            message: "Agendamento realizado com sucesso!",
            status: 200,
        });

        return response;
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { error: "Erro ao agendar horário." },
            { status: 500 }
        );
    }
}