

import { MESES, DIAS_HDR } from "@/app/lib/Constants";

export function isBeforeToday(d: Date) {
    const t = new Date(); t.setHours(0, 0, 0, 0);
    const c = new Date(d); c.setHours(0, 0, 0, 0);
    return c < t;
}

export function isSameDay(a: Date, b: Date) {
    return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export function fmtShort(d: Date) { return `${d.getDate()} ${MESES[d.getMonth()].slice(0, 3)}`; }

export function fmtFull(d: Date) { return `${d.getDate()} de ${MESES[d.getMonth()]}`; }