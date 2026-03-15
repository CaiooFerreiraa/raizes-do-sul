"use client"

import { registerAction } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { Loader2, ArrowLeft, ChevronDown, ChevronUp, MapPin, User, Mail, Lock, Phone } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function RegisterPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showAdvance, setShowAdvance] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const formData = new FormData(e.currentTarget);
    try {
      const res = await registerAction(formData);
      if (res?.error) {
        setError(res.error);
        setLoading(false);
      } else if (res?.success) {
        toast.success("Conta criada com sucesso! Faça login para continuar.");
        router.push("/login");
      }
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4 relative overflow-hidden py-8">
      <div className="absolute inset-0 bg-[url('/IMG_20260219_233217_505-1.webp')] bg-cover bg-center mix-blend-multiply opacity-5 blur-sm" />
      
      <div className="w-full max-w-xl bg-card border border-border/50 rounded-[2rem] shadow-2xl relative z-10 overflow-hidden transition-all">
        <div className="p-6 sm:p-10">

          <header className="mb-6">
            <h1 className="font-display text-3xl font-bold text-foreground tracking-tight mb-1">Criar Conta</h1>
            <p className="text-xs text-muted-foreground">Junte-se à Raízes do Sul</p>
          </header>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="name" className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-1">Nome Completo</Label>
                <Input id="name" name="name" type="text" placeholder="Seu nome completo" required className="h-11 rounded-xl bg-secondary/50 border-transparent focus-visible:ring-primary focus-visible:border-primary px-4 text-sm" />
              </div>
              
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-1">E-mail</Label>
                <Input id="email" name="email" type="email" placeholder="seu@email.com" required className="h-11 rounded-xl bg-secondary/50 border-transparent focus-visible:ring-primary focus-visible:border-primary px-4 text-sm" />
              </div>
              
              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-1">Senha</Label>
                <Input id="password" name="password" type="password" placeholder="Crie uma senha" required className="h-11 rounded-xl bg-secondary/50 border-transparent focus-visible:ring-primary focus-visible:border-primary px-4 text-sm" />
              </div>

              <div className="sm:col-span-2 pt-2">
                <button 
                  type="button"
                  onClick={() => setShowAdvance(!showAdvance)}
                  className="w-full flex items-center justify-between p-4 rounded-xl border border-dashed border-border/50 hover:bg-secondary/20 transition-all group"
                >
                  <div className="flex items-center gap-3 text-left">
                    <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                      <MapPin className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-foreground">Informações de Entrega</p>
                      <p className="text-[10px] text-muted-foreground">Opcional (Recomendado)</p>
                    </div>
                  </div>
                  {showAdvance ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                </button>

                {showAdvance && (
                  <div className="space-y-4 pt-4 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="space-y-1.5">
                      <Label htmlFor="phone" className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-1">WhatsApp</Label>
                      <Input id="phone" name="phone" type="tel" placeholder="(00) 00000-0000" className="h-11 rounded-xl bg-secondary/50 border-transparent focus-visible:ring-primary focus-visible:border-primary px-4 text-sm" />
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                      <div className="sm:col-span-3 space-y-1.5">
                        <Label htmlFor="street" className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-1">Rua</Label>
                        <Input id="street" name="street" type="text" placeholder="Rua" className="h-11 rounded-xl bg-secondary/50 border-transparent focus-visible:ring-primary focus-visible:border-primary px-4 text-sm" />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="number" className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-1">Nº</Label>
                        <Input id="number" name="number" type="text" placeholder="123" className="h-11 rounded-xl bg-secondary/50 border-transparent focus-visible:ring-primary focus-visible:border-primary px-4 text-sm" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label htmlFor="neighborhood" className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-1">Bairro</Label>
                        <Input id="neighborhood" name="neighborhood" type="text" placeholder="Bairro" className="h-11 rounded-xl bg-secondary/50 border-transparent focus-visible:ring-primary focus-visible:border-primary px-4 text-sm" />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="reference" className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-1">Referência</Label>
                        <Input id="reference" name="reference" type="text" placeholder="Próximo a..." className="h-11 rounded-xl bg-secondary/50 border-transparent focus-visible:ring-primary focus-visible:border-primary px-4 text-sm" />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {error && <p className="text-destructive font-bold text-[10px] text-center p-2 bg-destructive/10 rounded-lg">{error}</p>}
            
            <div className="pt-2">
              <Button 
                type="submit" 
                disabled={loading} 
                className="w-full h-12 rounded-xl cursor-pointer font-bold text-base bg-primary hover:bg-primary/90 text-primary-foreground shadow-xl transition-all active:scale-[0.98]"
              >
                {loading ? <Loader2 className="animate-spin w-5 h-5 mx-auto" /> : "Criar Minha Conta"}
              </Button>
            </div>
            
            <p className="text-center text-xs text-muted-foreground">
              Já tem uma conta?{" "}
              <Link href="/login" className="text-primary font-bold hover:underline">
                Entrar
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
