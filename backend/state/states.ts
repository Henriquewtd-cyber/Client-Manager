


//lista de estados possíveis (AGUARDANDO_PAGAMENTO, CONFIRMADO, etc)

export const STATES = {
    AGUARDANDO_PAGAMENTO: "AGUARDANDO_PAGAMENTO" as string,
    MANDOU_COMPROVANTE: "MANDOU_COMPROVANTE" as string,
    ACEITO: "ACEITO" as string,
    CONFIRMADO: "CONFIRMADO" as string,
    CANCELADO: "CANCELADO" as string,
} as const