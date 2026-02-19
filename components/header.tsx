"use client"

import Link from "next/link"
import { useEffect, useState } from "react"

import { Bell, User, Calendar, DollarSign } from "lucide-react"
import { Button } from "@/components/ui/button"


export function Header() {



  return (
    <>
      <header className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="flex items-center justify-between">
          {/* LOGO */}
          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-3">
              <div className="text-2xl">🏢</div>
              <div>
                <h1 className="text-xl font-bold text-slate-700">CLIENT MANAGER</h1>
                <p className="text-sm text-slate-600">Controle de Clientes</p>
              </div>
            </div>
          </div>

          {/* icons/buttons */}
          <div className="flex items-center space-x-4">
            <Button variant="default" size="icon">
              <Bell className="w-5 h-5 text-slate-700" />
            </Button>

            <Link href="/schedule">
              <Button variant="default" size="icon">
                <Calendar className="w-5 h-5 text-slate-700" />
              </Button>
            </Link>

            <Link href="/finance">
              <Button variant="default" size="icon">
                <DollarSign className="w-5 h-5 text-slate-700" />
              </Button>
            </Link>

            <Link href="/login">
              <Button variant="default" size="icon">
                <User className="w-5 h-5 text-slate-700" />
              </Button>
            </Link>



          </div>
        </div>
      </header>
    </>
  )


}