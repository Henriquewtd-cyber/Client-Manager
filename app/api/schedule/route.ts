
import { NextResponse } from "next/server";
import { pegarTodosEventos } from "@/app/services/user.service";

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