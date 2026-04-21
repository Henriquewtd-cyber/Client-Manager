import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";

import { Header } from "@/components/header";

import "./globals.css";

export const metadata: Metadata = {
  title: "Client Manager",
  description: "Gerencie seus clientes de forma eficiente e organizada com o Client Manager. Mantenha todas as informações dos seus clientes em um só lugar, facilite o acompanhamento de interações e melhore o relacionamento com seus clientes.",
  generator: "Next.js",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="pt-BR">
      <body className="bg-slate-50">
        <div className="min-h-screen flex flex-col">
          <Header />
          <div className="flex flex-1 w-full overflow-hidden">
            <main className="flex-1 overflow-y-auto p-6">{children} <Analytics /></main>
          </div>
        </div>
      </body>
    </html>
  );
}