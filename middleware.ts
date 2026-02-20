import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose"; // utilizando jose ao invez do jwt, na pratica pouca coisa muda, mas jose é mais atual.
import path from "path";

type JWTPayload = {
    sub: string;
    role: "user" | "adm"; //definição dos possiveis papeis do usuario
};

export async function middleware(request: NextRequest) {
    const pathname = request.nextUrl.pathname; //pega o nome da url que esta sendo acessada, exemplo: /docs

    if (
        //todas essas rotas são publicas conforme estabelecidas, as duas primeiras são paginas intermediarias do next, precisam estar aqui para a pagina rodar
        pathname === "/" ||
        pathname.startsWith("/_next") ||
        pathname.startsWith("/favicon.ico") ||
        pathname.startsWith("/api/auth") ||
        pathname.startsWith("/api/public") ||
        pathname.startsWith("/login") ||
        pathname.startsWith("/new-appointment")
    ) {
        return NextResponse.next(); // Se o usuario esta tentando acessar qualquer uma dessas rotas, a reposta é sempre liberar o acesso.
    }

    const token = request.cookies.get("session")?.value || ""; // pega o token gerado ou não em login

    try {
        const { payload } = await jwtVerify(
            //verifica o token, incluindo tempo de sessão e afins
            token,
            new TextEncoder().encode(process.env.JWT_SECRET!),
        );

        const role = (payload as JWTPayload).role; // pega qual a role do usuario, adm ou user

        if (
            (pathname.startsWith("/schedule") || pathname.startsWith("/finance")) &&
            role !== "adm"
        ) {
            // se o usuario tenta acessar documentos ou admin panel sem ser role adm redireciona para login (bloqueia o acesso)
            return NextResponse.redirect(new URL("/login", request.url));
        }

        return NextResponse.next(); // se não foi direcionado tudo bem, pode liberar o acesso para docs ou panel.
    } catch (error) {
        return NextResponse.redirect(new URL("/login", request.url)); // se algo der errado, por exemplo tentar acessar docs sem ter efetuado login (token = null) ira dar erro e portanto sera mandado para login.
    }
}