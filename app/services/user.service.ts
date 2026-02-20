
import { type User, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";


// Função para buscar um usuário pelo email
export async function buscarUsuarioPorEmail(email: string): Promise<User | null> {
    return await prisma.user.findUnique({
        where: {
            email: email,
        },
    });
}


// Função para criar um novo usuário
export async function criarUsuario() {
    try {
        const password = "123456";
        const email = "henrique@email.com";
        const hashedPassword = await bcrypt.hash(password, 10);

        await prisma.user.create({
            data: {
                role: "adm",
                name: "Henrique",
                email,
                password: hashedPassword
            },
        });
        console.log("Usuário criado com sucesso!");
    } catch (error) {
        console.error("Erro ao criar usuário:", error);
    }
}