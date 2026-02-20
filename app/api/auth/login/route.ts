// arquivo para organizar as rotas de requisição de login

import { NextResponse } from "next/server";
import * as bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import { buscarUsuarioPorEmail, criarUsuario } from "@/app/services/user.service";

export async function POST(request: Request) {
    const user = await request.json();

    const { email, senha, manter } = user;

    const tempo = manter ? "7d" : "1h";

    try {
        criarUsuario();
        const user = await buscarUsuarioPorEmail(email);

        if (!user) {
            return NextResponse.json(
                { error: "Usuário não encontrado" },
                { status: 404 }
            );
        }

        const sucesso = await bcrypt.compare(senha, user.password);

        if (!sucesso) {
            return NextResponse.json({ error: "Senha incorreta" }, { status: 401 });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            process.env.JWT_SECRET!,
            { expiresIn: tempo }
        );

        const response = NextResponse.json({
            ok: true,
            message: "Login realizado com sucesso!",
            status: 200,
        });

        response.cookies.set({
            name: "session",
            value: token,
            httpOnly: true,
            path: "/",
            sameSite: "strict",
            secure: true,
            maxAge: manter ? 60 * 60 * 24 * 7 : 60 * 60 // segundos,
        });

        return response;
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { error: "Erro ao logar usuário." },
            { status: 500 }
        );
    }
}