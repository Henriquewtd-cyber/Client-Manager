"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ToastContainer, useToast } from "@/components/toast";
import Link from "next/link";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function Login() {
  const router = useRouter();
  const { toasts, addToast, removeToast } = useToast();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [check, setCheck] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (email.length == 0 || senha.length == 0) {
      addToast("Por favor, preencha todos os campos", "info");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-type": "application/json" },
        body: JSON.stringify({ email, senha, manter: check }),
      });

      if (!res.ok) {
        setIsLoading(false);
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const data = await res.json();
          addToast(
            "Erro ao realizar login: " + (data.error || "Erro desconhecido"),
            "error"
          );
        } else {
          addToast("Erro ao realizar login: " + res.statusText, "error");
        }
        return;
      }

      const data = await res.json();

      if (data.status === 200) {
        addToast("Login realizado com sucesso!", "success");
        setTimeout(() => {
          window.location.href = "/schedule"; // Redireciona para a página de agendamento após o login
        }, 1000);
      } else {
        setIsLoading(false);
        addToast("Erro ao realizar login: " + data.error, "error");
      }
    } catch (error) {
      setIsLoading(false);
      console.error("Erro na requisição:", error);
      addToast("Erro ao realizar login. Tente novamente.", "error");
    }
  }

  return (
    <div className="flex items-center justify-center bg-gray-100 p-4 min-h-screen flex-col">
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-40">
          <div className="bg-white p-8 rounded-2xl shadow-xl flex flex-col items-center gap-4">
            <Loader2 className="w-12 h-12 text-blue-700 animate-spin" />
            <p className="text-slate-700 font-medium">Entrando...</p>
          </div>
        </div>
      )}

      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl min-h-87.5 flex flex-col justify-between mb-20">
        <form
          onSubmit={handleSubmit}
          className="flex flex-col justify-between min-h-82.5"
        >
          <Label className="text-xl text-center block">Entrar</Label>

          <Input
            type="email"
            placeholder="Email:"
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            type="password"
            placeholder="Senha:"
            onChange={(e) => setSenha(e.target.value)}
          />

          <div className="flex flex-lin justify-between items-center">
            <div className="itens-center flex">
              <Checkbox
                checked={check}
                onCheckedChange={(checked) => {
                  setCheck(!!checked);
                }}
              ></Checkbox>
              <span className="mx-2">Manter conectado</span>
            </div>
          </div>

          <Button variant="default" className="w-full " type="submit" disabled={isLoading}>
            {isLoading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Entrando...
              </span>
            ) : (
              "Login"
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}