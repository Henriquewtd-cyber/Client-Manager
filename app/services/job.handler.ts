
// arquivo para organizar os handlers relacionados aos jobs para o n8n
import dotenv from "dotenv";
import { NextResponse } from "next/server";

dotenv.config();

export async function enviarConfirmacaoN8N(data: {
    id: string;
    data: Date;
    telefone: string;
    nome: string;
    service: string;
}) {
    if (![55].includes(parseInt(data.telefone))) {
        data.telefone = "55" + data.telefone;
    }
    data.telefone = data.telefone.replace(/\D/g, ""); // Remove caracteres não numéricos

    console.log("Enviando confirmação para n8n:", data);
    const response = await fetch(
        process.env.N8N_WEBHOOK_URL!,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        }
    );

    if (!response.ok) {
        throw new Error("Erro ao chamar n8n");
    }

    return response.json();
}

export async function enviarLembreteN8N(data: {
    telefone: string;
    nome: string;
    data: Date;
    service: string;
}) {

    if (![55].includes(parseInt(data.telefone))) {
        data.telefone = "55" + data.telefone;
    }


    const response = await fetch(
        process.env.N8N_WEBHOOK_URL!,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ data })
        }
    );

    if (!response.ok) {
        throw new Error("Erro ao chamar n8n");
    }

    return response.json();
}