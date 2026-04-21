

import { NextResponse } from 'next/server';
import { handleMessage } from "@/backend/services/conversation.service";

export async function POST(request: Request) {
    const body = await request.json();
    console.log('Received waha webhook:', body);

    const response = handleMessage({ message: body.message, telefone: body.telefone, messageType: body.msgtype, nome: body.nome });
    return NextResponse.json({ status: 'Message handled', result: response });
}
