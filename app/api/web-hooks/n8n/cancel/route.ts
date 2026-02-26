
// arquivo para organizar as rotas de requisição do n8n

import { NextResponse } from "next/server";

import { confirmarEvento } from "@/app/services/user.service";

export async function POST(request: Request) {
    const data = await request.json();

    const { cancel, id } = data;


    try {
        let mensagem = "";

        if (cancel) {
            await confirmarEvento(id, "cancelado");
            mensagem = "Agendamento cancelado com sucesso!";
        } else {
            await confirmarEvento(id, "confirmado");
            mensagem = "Agendamento confirmado com sucesso!";
        }

        const response = NextResponse.json({
            ok: true,
            message: mensagem,
            status: 200,
        });

        return response;
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { error: "Erro ao confirmar agendamento." },
            { status: 500 }
        );
    }
}