
import { useState } from "react";
import { MESES, DIAS_HDR } from "@/app/lib/Constants";
import { isBeforeToday, isSameDay } from "@/app/lib/DateHelpers";

export function MiniCalendar({ accentColor, selected, onSelect }: {
    accentColor: string;
    selected: Date | null;
    onSelect: (d: Date) => void;
}) {
    const today = new Date();
    const [year, setYear] = useState(today.getFullYear());
    const [month, setMonth] = useState(today.getMonth());

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells: (number | null)[] = [
        ...Array(firstDay).fill(null),
        ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
    ];
    while (cells.length % 7 !== 0) cells.push(null);

    const prev = () => { if (month === 0) { setMonth(11); setYear(y => y - 1); } else setMonth(m => m - 1); };
    const next = () => { if (month === 11) { setMonth(0); setYear(y => y + 1); } else setMonth(m => m + 1); };

    return (
        <div className="select-none w-60">
            <div className="flex items-center justify-between mb-3">
                <button onClick={prev} className="cursor-pointer w-7 h-7 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-colors">‹</button>
                <span className="text-xs font-bold text-gray-700" style={{ fontFamily: "'Syne',sans-serif" }}>
                    {MESES[month].slice(0, 3)} {year}
                </span>
                <button onClick={next} className="cursor-pointer w-7 h-7 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-colors">›</button>
            </div>
            <div className="grid grid-cols-7 mb-1">
                {DIAS_HDR.map((d, i) => (
                    <div key={i} className="text-center text-[9px] font-bold py-0.5" style={{ color: accentColor + "99" }}>{d}</div>
                ))}
            </div>
            <div className="grid grid-cols-7 gap-0.5">
                {cells.map((day, i) => {
                    if (!day) return <div key={i} className="aspect-square" />;
                    const d = new Date(year, month, day);
                    const past = isBeforeToday(d);
                    const isTod = isSameDay(d, today);
                    const isSel = selected ? isSameDay(d, selected) : false;
                    return (
                        <button key={i} disabled={past} onClick={() => onSelect(d)}
                            className={`aspect-square rounded-lg text-[11px] font-semibold flex items-center justify-center transition-all
                ${past ? "text-gray-200 cursor-not-allowed" :
                                    isSel ? "text-white scale-110 shadow-sm cursor-pointer" :
                                        isTod ? "font-bold cursor-pointer" :
                                            "text-gray-600 hover:bg-gray-100 hover:scale-105 cursor-pointer"}`}
                            style={isSel ? { background: accentColor } : isTod ? { color: accentColor, outline: `1.5px solid ${accentColor}44`, borderRadius: "8px" } : {}}
                        >{day}</button>
                    );
                })}
            </div>
        </div>
    );
}