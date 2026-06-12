"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { Bell, User, Calendar, DollarSign } from "lucide-react"
import { Button } from "@/components/ui/button"
import { usePathname } from 'next/navigation'

export function Header() {
  const pathname = usePathname()
  const [showHeader, setShowHeader] = useState(true)

  useEffect(() => {
    if (pathname.startsWith("/new-appointment")) {
      setShowHeader(false)
    } else {
      setShowHeader(true)
    }
  }, [pathname])

  if (!showHeader) return null

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-slate-200 select-none">
      <div className="px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-between">

          {/* Logo */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-1 h-10 rounded-full bg-blue-600 shrink-0" />

            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center shrink-0">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <circle cx="9" cy="7" r="3" fill="#1e40af" />
                <path
                  d="M3 19c0-3.314 2.686-6 6-6s6 2.686 6 6"
                  stroke="#1e40af"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
                <circle cx="17" cy="9" r="2.2" fill="#60a5fa" />
                <path
                  d="M14.5 19c0-2.485 1.567-4.5 3.5-4.5s3.5 2.015 3.5 4.5"
                  stroke="#60a5fa"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
              </svg>
            </div>

            <div className="leading-tight min-w-0">
              <h1 className="text-base font-bold text-slate-800 tracking-tight truncate">
                ClientManager
              </h1>

              <p className="hidden sm:block text-[10px] font-semibold text-slate-400 tracking-[0.18em] uppercase mt-1">
                Sistema de Agendamentos
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 sm:gap-2">

            <Button
              className="bg-transparent hover:bg-slate-100 rounded-xl shadow-none"
              variant="default"
              size="icon"
            >
              <Bell className="w-5 h-5 text-slate-600" />
            </Button>

            <Link href="/schedule">
              <Button
                className="bg-transparent hover:bg-blue-50 hover:text-blue-600 rounded-xl shadow-none"
                variant="default"
                size="icon"
              >
                <Calendar className="w-5 h-5 text-slate-600" />
              </Button>
            </Link>

            <Link href="/finance">
              <Button
                className="bg-transparent hover:bg-emerald-50 hover:text-emerald-600 rounded-xl shadow-none"
                variant="default"
                size="icon"
              >
                <DollarSign className="w-5 h-5 text-slate-600" />
              </Button>
            </Link>

            <Link href="/login">
              <Button
                className="bg-transparent hover:bg-slate-100 rounded-xl shadow-none"
                variant="default"
                size="icon"
              >
                <User className="w-5 h-5 text-slate-600" />
              </Button>
            </Link>

          </div>
        </div>
      </div>
    </header>
  )
}