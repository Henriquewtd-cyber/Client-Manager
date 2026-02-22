
import { useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { FloatPos } from "@/app/types/appointment";

export function DropdownPortal({ pos, onClose, children }: {
    pos: FloatPos;
    onClose: () => void;
    children: React.ReactNode;
}) {
    const panelRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
                onClose();
            }
        };
        const t = setTimeout(() => document.addEventListener("mousedown", handler), 10);
        return () => { clearTimeout(t); document.removeEventListener("mousedown", handler); };
    }, [onClose]);

    return createPortal(
        <div
            ref={panelRef}
            style={{
                position: "fixed",
                top: pos.top,
                left: pos.left,
                zIndex: 99999,
            }}
        >
            {children}
        </div>,
        document.body
    );
}