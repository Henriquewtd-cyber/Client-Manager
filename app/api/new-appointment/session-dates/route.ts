import { NextResponse } from "next/server";
import { pegarDatas } from "@/app/services/user.service";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

const TIMEZONE = "America/Sao_Paulo";

type Appointment = {
    start: string;
    end: string;
};

export async function GET(request: Request) {
    const horarios = [
        "07:00", "07:30", "08:00", "08:30", "09:00", "09:30",
        "10:00", "10:30", "11:00", "11:30", "13:00", "13:30",
        "14:00", "14:30", "15:00", "15:30", "16:00", "16:30",
        "17:00", "17:30", "18:00", "18:30", "19:00", "19:30",
    ];

    const avaliableTimes: Record<string, string[]> = {};

    try {
        const datas = await pegarDatas();

        const hoje = dayjs().tz(TIMEZONE);
        const limite = hoje.add(6, "month");

        let dataAtual = hoje;

        while (
            dataAtual.isBefore(limite) ||
            dataAtual.isSame(limite, "day")
        ) {
            const diaDaSemana = dataAtual.day(); // 0 = domingo, 6 = sábado

            if (diaDaSemana !== 0) {
                const dateKey = dataAtual.format("YYYY-MM-DD");

                if (dataAtual.isSame(hoje, "day")) {
                    // Para hoje: filtra horários que já passaram (+ 30min de margem)
                    const agora = hoje.add(30, "minute");
                    avaliableTimes[dateKey] = horarios.filter((horario) => {
                        const [h, m] = horario.split(":").map(Number);
                        const slotHoje = dataAtual.hour(h).minute(m).second(0);
                        return slotHoje.isAfter(agora);
                    });
                } else {
                    avaliableTimes[dateKey] = [...horarios];
                }
            }

            dataAtual = dataAtual.add(1, "day");
        }

        // Remove horários já ocupados (considerando duração)
        datas.forEach((data: Appointment) => {
            const inicio = dayjs(data.start).tz(TIMEZONE);
            const fim = dayjs(data.end).tz(TIMEZONE);
            const dateKey = inicio.format("YYYY-MM-DD");

            if (!avaliableTimes[dateKey]) return;

            avaliableTimes[dateKey] = avaliableTimes[dateKey].filter((horario) => {
                const [h, m] = horario.split(":").map(Number);
                const slot = inicio.hour(h).minute(m).second(0);

                // Remove o slot se ele começa antes do fim e termina depois do início
                const slotFim = slot.add(30, "minute");
                return !(slot.isBefore(fim) && slotFim.isAfter(inicio));
            });
        });

        return NextResponse.json({ availableTimes: avaliableTimes });
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { error: "Erro ao buscar datas disponíveis." },
            { status: 500 }
        );
    }
}