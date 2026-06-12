
import { NextResponse } from "next/server";
import { pegarFinancas, criarFinanca, deletarFinanca } from "@/app/services/user.service";

export async function POST(request: Request) {

    const req = await request.json();

    try {

        criarFinanca(req);
        const response = NextResponse.json({
            status: 200,
        });

        return response;

    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { error: "Erro ao criar finança." },
            { status: 500 }
        );
    }
}

export async function GET() {

    try {

        const response = NextResponse.json({
            status: 200,
            financas: await pegarFinancas(),
        });

        return response;

    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { error: "Erro ao buscar finanças." },
            { status: 500 }
        );
    }
}

export async function DELETE(request: Request) {

    const req = await request.json();

    try {
        deletarFinanca(req.id);
        const response = NextResponse.json({
            status: 200,
        });

        return response;

    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { error: "Erro ao deletar finança." },
            { status: 500 }
        );
    }
}