import { useState } from "react";
import { FloatPos } from "@/app/types/appointment";

export function usePortalDropdown() {
    const [pos, setPos] = useState<FloatPos | null>(null);

    const open = (btn: HTMLButtonElement) => {
        const r = btn.getBoundingClientRect();
        // position:fixed usa coordenadas de viewport — getBoundingClientRect já devolve isso
        setPos({ top: r.bottom + 6, left: r.left });
    };

    const close = () => setPos(null);
    const toggle = (btn: HTMLButtonElement) => pos ? close() : open(btn);

    return { pos, open, close, toggle, isOpen: pos !== null };
}