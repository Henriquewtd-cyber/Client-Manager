
import { type User, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { JsonObject } from "@prisma/client/runtime/library";


// Função para buscar um usuário pelo email
export async function buscarUsuarioPorEmail(email: string): Promise<User | null> {
    try {
        return await prisma.user.findUnique({
            where: {
                email: email,
            },
        });
    } catch (error) {
        console.error("Erro ao buscar usuário:", error);
        return null;
    }
}


// Função para criar um novo usuário
export async function criarUsuario(data: { name: string; email: string; password: string; role: string }): Promise<User | null> {
    try {
        const role = data.role;
        const name = data.name;
        const email = data.email;
        const password = data.password;


        await prisma.user.create({
            data: {
                role: role,
                name: name,
                email: email,
                password: password
            },
        });

        return null;

    } catch (error) {
        console.error("Erro ao criar usuário:", error);
        return null;
    }
}

//Função para criar um evento novo

export async function criarEvento(data: any) {
    const eventColors: Record<string, string> = {
        "Análise de Perfil": "#1E90FF",  // Azul
        "Reunião de Cliente": "#FFA500",  // Laranja
        "Sessão estratégica": "#32CD32",  // Verde
        "Terapia": "#FF69B4",           // Rosa
        "Aula de Teclado": "#8A2BE2", // Azul-claro
        "Desenv. Pessoal": "#FFD700", // Dourado
    };

    try {
        await prisma.event.create({
            data: {
                title: data.title,
                nomeCliente: data.nomeCliente,
                telefone: data.telefone,
                start: data.start,
                end: data.end,
                description: data.description,
                status: data.status,
                color: eventColors[data.title] || "#1E90FF", // Cor padrão se não encontrada
            },
        });
    } catch (error) {
        console.error("Erro ao criar evento:", error);
    }
}

//Função para pegar todos os eventos do banco de dados

export async function pegarTodosEventos() {
    try {
        const eventos = await prisma.event.findMany();
        return eventos;
    } catch (error) {
        console.error("Erro ao buscar eventos:", error);
        return [];
    }
}

//Função para pegar apenas as datas de até 6 meses dos eventos do banco de dados
export async function pegarDatas() {
    try {
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);

        const seisMesesDepois = new Date();
        seisMesesDepois.setMonth(seisMesesDepois.getMonth() + 6);

        const datas = await prisma.event.findMany({
            where: {
                start: {
                    gte: hoje,
                    lte: seisMesesDepois,
                },
            },
            select: {
                start: true,
                end: true,
            },
        });

        return datas;
    } catch (error) {
        console.error("Erro ao buscar datas:", error);
        return [];
    }
}