
import { type User, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { JsonObject } from "@prisma/client/runtime/library";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";



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
        const evento = await prisma.event.create({
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
        return evento;
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

        dayjs.extend(utc);

        const hoje = dayjs().utc().startOf("day").toDate();
        const seisMesesDepois = dayjs().utc().add(6, "month").endOf("day").toDate();

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

//Função para verificar a disponibilidade de um horário para um evento

export async function verificarDisponibilidade(start: Date, end: Date): Promise<boolean> {
    try {
        const eventos = await prisma.event.findMany({
            where: {
                OR: [
                    {
                        start: {
                            lte: start,
                            gte: end,
                        },
                    },
                    {
                        end: {
                            lte: start,
                            gte: end,
                        },
                    },
                ],
            },
        });

        return eventos.length === 0;
    } catch (error) {
        console.error("Erro ao verificar disponibilidade:", error);
        return false;
    }
}

//Função para deletar um evento do banco de dados
export async function deletarEvento(id: string) {
    try {
        await prisma.event.delete({
            where: {
                id: id,
            },
        });
        return true;
    } catch (error) {
        console.error("Erro ao deletar evento:", error);
        return false;
    }
}

//Função para confirmar um evento do banco de dados
export async function confirmarEvento(id: string, status: string) {
    try {
        await prisma.event.update({
            where: {
                id: id,
            },
            data: {
                status: status,
            },

        });
        return true;
    } catch (error) {
        console.error("Erro ao confirmar evento:", error);
        return false;
    }
}

//Função para editar a data de um evento do banco de dados
export async function editarEvento(id: string, newStart: Date, newEnd: Date) {
    try {

        if (!await verificarDisponibilidade(newStart, newEnd)) {
            throw new Error("Horário indisponível para agendamento.");
        }
        await prisma.event.update({
            where: {
                id: id,
            },
            data: {
                start: newStart,
                end: newEnd,
            },
        });


    } catch (error) {
        console.error("Erro ao editar evento:", error);
    }
}

//Função para achar o id de um evento pendente no banco de dados
export async function acharIdEventoPendente(estado: string, telefone: string): Promise<string | null> {
    try {
        const evento = await prisma.event.findFirst({
            where: {
                status: estado,
                telefone: telefone,
            },
        });

        return evento ? evento.id : null;
    } catch (error) {
        console.error("Erro ao achar id do evento:", error);
        return null;
    }
}