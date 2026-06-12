
import { NextResponse } from "next/server";
import { criarEvento, pegarTodosEventos } from "@/app/services/user.service";

export async function POST(request: Request) {

    let { slots, total, service, dados, duration, tipo } = await request.json();

    try {
        if (!duration) duration = 30;

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
                title: service || dados.title || "Sem título",
                nomeCliente: dados.nome || dados.nomeCliente || "Pessoal",
                telefone: dados.telefone || "Sem telefone",
                start: startDate,
                end: finalDate,
                description: dados.descricao || dados.description || "Sem descrição",
                status: "Pendente",
                type: tipo
            };
            const evento = await criarEvento(data);

            if (!evento) {
                throw new Error("Nenhum evento encontrado");
            }

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