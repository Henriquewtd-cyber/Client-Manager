
import { NextResponse } from "next/server";
import { deletarEvento, pegarTodosEventos } from "@/app/services/user.service";

export async function GET() {
    try {
        const eventos = await pegarTodosEventos();

        return NextResponse.json(eventos);
    } catch (error) {
        console.error("Erro ao buscar eventos:", error);
        return NextResponse.json(
            { error: "Erro ao buscar eventos." },
            { status: 500 }
        );
    }
}

export async function DELETE(request: Request) {
    try {
        const { id } = await request.json();
        await deletarEvento(id);
        return NextResponse.json({ message: "Evento deletado com sucesso." });
    } catch (error) {
        console.error("Erro ao deletar evento:", error);
        return NextResponse.json(
            { error: "Erro ao deletar evento." },
            { status: 500 }
        );
    }
}