
import { NextResponse } from "next/server";
import { pegarDatas } from "@/app/services/user.service";
import dayjs from "dayjs";

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

        const hoje = dayjs();
        const limite = hoje.add(6, "month");

        let dataAtual = hoje;

        while (dataAtual.isBefore(limite) || dataAtual.isSame(limite, "day")) {
            avaliableTimes[dataAtual.toISOString().split("T")[0]] = horarios;
            dataAtual = dataAtual.add(1, "day");
        }


        datas.forEach((data) => {
            const date = new Date(data.start);
            const dateKey = date.toISOString().split("T")[0];

            let datasDisponiveis = [...horarios];

            if (avaliableTimes[dateKey]) {
                datasDisponiveis = avaliableTimes[dateKey];
            }
            const time = date.toISOString().split("T")[1].split(".")[0].slice(0, 5);

            if (datasDisponiveis.includes(time)) {
                datasDisponiveis = datasDisponiveis.filter((t) => t !== time);
            }

            avaliableTimes[dateKey] = datasDisponiveis;
        });

        const response = NextResponse.json({
            availableTimes: avaliableTimes,
        });

        return response;
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { error: "Erro ao buscar datas disponíveis." },
            { status: 500 }
        );
    }
}