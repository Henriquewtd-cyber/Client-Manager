
// arquivo para organizar as rotas de requisição do n8n

import { NextResponse } from "next/server";

import { confirmarEvento } from "@/app/services/user.service";

export async function POST(request: Request) {
    const data = await request.json();


    const { confirm, id } = data;



    try {
        let mensagem = "";
        let status = 200;
        let ok = true;

        if (confirm) {
            if (await confirmarEvento(id, "confirmado")) {
                mensagem = "Agendamento confirmado com sucesso!";
                status = 200;
                ok = true;
            } else {
                mensagem = "Erro ao confirmar agendamento.";
                status = 500;
                ok = false;
            }
        } else {
            if (await confirmarEvento(id, "cancelado")) {
                mensagem = "Agendamento cancelado com sucesso!";
                status = 200;
                ok = true;
            } else {
                mensagem = "Erro ao cancelar agendamento.";
                status = 500;
                ok = false;
            }
        }

        const response = NextResponse.json({
            ok: ok,
            message: mensagem,
            status: status,
        });

        return response;

    } catch (error) {
        console.error("Erro ao confirmar evento:", error);
        return NextResponse.json(
            { error: "Erro ao confirmar evento." },
            { status: 500 }
        );
    }

}



