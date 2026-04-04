

// Conexão com o Redis e serviços relativos a cache e filas de mensagens


import Redis from "ioredis"
import dotenv from "dotenv"

dotenv.config()

const redis = new Redis({
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT),
    password: process.env.REDIS_PASSWORD,
})

/* =========================
   🔧 Helpers genéricos
========================= */

export async function getJSON<T>(key: string): Promise<T | null> {
    const data = await redis.get(key)
    return data ? JSON.parse(data) : null
}

export async function setJSON(key: string, value: any, ttl?: number) {
    if (ttl) {
        await redis.set(key, JSON.stringify(value), "EX", ttl)
    } else {
        await redis.set(key, JSON.stringify(value))
    }
}

export async function del(key: string) {
    await redis.del(key)
}

/* =========================
   🧠 Sessão (chatbot)
========================= */

const SESSION_TTL = 60 * 10 // 10 minutos

function sessionKey(userId: string) {
    return `session:${userId}`
}

export type Session = {
    estado: string
    telefone: string
    lastMsg?: string
    paymentId?: string
}

export async function getSession(userId: string): Promise<Session | null> {
    return getJSON<Session>(sessionKey(userId))
}

export async function setSession(userId: string, session: Session) {
    return setJSON(sessionKey(userId), session, SESSION_TTL)
}

export async function updateSession(
    userId: string,
    updater: (session: Session) => Session
) {
    const current =
        (await getSession(userId)) || { estado: "NOVO", telefone: "", lastMsg: undefined }

    const updated = updater(current)

    await setSession(userId, updated)

    return updated
}

export async function deleteSession(userId: string) {
    return del(sessionKey(userId))
}