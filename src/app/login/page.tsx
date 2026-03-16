"use client"

import { loginAction } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const formData = new FormData(e.currentTarget);
    try {
      const res = await loginAction(formData);
      if (res?.error) {
        setError(res.error);
        setLoading(false);
      } else {
        // Redireciona via window.location para garantir limpeza total do cache da sessão
        window.location.href = "/";
      }
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4 relative overflow-hidden text-foreground">
      <div className="absolute inset-0 bg-[url('/IMG_20260219_233217_505-1.webp')] bg-cover bg-center mix-blend-multiply opacity-5 blur-sm" />
      
      <div className="w-full max-w-lg border border-border/50 bg-card rounded-[2rem] p-8 sm:p-12 shadow-2xl relative z-10 transition-all flex flex-col">
        <div className="text-center mb-10 space-y-2">
          <h1 className="font-display text-4xl font-bold text-foreground tracking-tight">Bem-vindo</h1>
          <p className="text-sm text-muted-foreground">Acesse sua conta Raízes do Sul</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email" className="font-medium text-muted-foreground ml-1">E-mail</Label>
            <Input id="email" name="email" type="email" placeholder="seu@email.com" required className="h-12 rounded-xl bg-secondary/50 border-transparent focus-visible:ring-primary focus-visible:border-primary px-4" />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password" className="font-medium text-muted-foreground ml-1">Senha</Label>
            <Input id="password" name="password" type="password" placeholder="Sua senha" required className="h-12 rounded-xl bg-secondary/50 border-transparent focus-visible:ring-primary focus-visible:border-primary px-4" />
          </div>

          {error && <p className="text-destructive font-semibold text-sm text-center mt-2">{error}</p>}
          
          <Button type="submit" disabled={loading} className="w-full h-14 rounded-full cursor-pointer font-bold text-lg mt-6 shadow-xl shadow-primary/10 hover:translate-y-[-2px] transition-all active:translate-y-[1px]">
            {loading ? <Loader2 className="animate-spin w-5 h-5 mx-auto text-primary-foreground" /> : "Iniciar Sessão"}
          </Button>
          
          <p className="text-center text-sm text-muted-foreground mt-8">
            Ainda não tem conta?{" "}
            <Link href="/register" className="text-primary font-bold hover:underline">
              Criar conta gratuita
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
