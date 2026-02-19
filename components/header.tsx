"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useState } from "react"

import { Bell, User, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ToastContainer, useToast } from "@/components/toast"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"

export function Header() {
  const pathname = usePathname()
  const router = useRouter()
  const { toasts, addToast, removeToast } = useToast()
  const [role, setRole] = useState<"user" | "adm" | null>(null)
  const [mounted, setMounted] = useState(false)

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      })
      const data = await response.json()
      if (data.ok) {
        addToast("Logout realizado com sucesso!", "success");
        // Usa window.location.href para garantir que a página recarregue completamente
        setTimeout(() => {
          window.location.href = "/login"
        }, 1000);
      }
    } catch (error) {
      console.error("Erro ao fazer logout:", error)
      addToast("Erro ao fazer logout", "error")
    }
  }

  useEffect(() => {
    setMounted(true)
    const fetchRole = async () => {
      try {
        const response = await fetch("/api/auth/session")
        const data = await response.json()
        if (data.ok && data.session) {
          // A API retorna o JWT decodificado diretamente em data.session
          const userRole = data.session.role as "user" | "adm"
          setRole(userRole)
        }
      } catch (error) {
        console.error("Erro ao buscar role:", error)
      }
    }

    fetchRole()
  }, [pathname])

  // Evita hydration mismatch renderizando conteúdo consistente no servidor
  if (!mounted) {
    return (
      <>
        <ToastContainer toasts={toasts} removeToast={removeToast} />
        <header className="bg-white border-b border-slate-200 px-6 py-4">
          <div className="flex items-center justify-between">
            {/* LOGO */}
            <div className="flex items-center space-x-8">
              <div className="flex items-center space-x-3">
                <div className="text-2xl">🏛️</div>
                <div>
                  <h1 className="text-xl font-bold text-blue-700">PET HISTÓRIA USP</h1>
                  <p className="text-sm text-slate-600">ARQUIVO DIGITAL</p>
                </div>
              </div>
            </div>

            {/* SEARCH + ICONS */}
            <div className="flex items-center space-x-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <User className="w-5 h-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href="/login">Fazer Login</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/signup">Fazer Cadastro</Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>
      </>
    )
  }

  return (
    <>
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <header className="bg-white border-b border-slate-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* LOGO */}
        <div className="flex items-center space-x-8">
          <div className="flex items-center space-x-3">
            <div className="text-2xl">🏛️</div>
            <div>
              <h1 className="text-xl font-bold text-blue-700">PET HISTÓRIA USP</h1>
              <p className="text-sm text-slate-600">ARQUIVO DIGITAL</p>
            </div>
          </div>
        </div>

        {/* SEARCH + ICONS */}
        <div className="flex items-center space-x-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <User className="w-5 h-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {role ? (
                <>
                  <DropdownMenuItem onClick={handleLogout}>Sair</DropdownMenuItem>
                </>
              ) : (
                <>
                  <DropdownMenuItem asChild>
                    <Link href="/login">Fazer Login</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/signup">Fazer Cadastro</Link>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
    </>
  )
}