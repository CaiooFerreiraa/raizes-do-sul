"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { User, Phone, MapPin, Save, Loader2, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { updateProfileAction } from "@/actions/profile";

export default function ProfilePage() {
  const { data: session, update } = useSession();
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    try {
      const res = await updateProfileAction(formData);
      if (res.success) {
        // Update session client-side
        await update();
        toast.success("Perfil atualizado com sucesso!");
      } else {
        toast.error(res.error || "Erro ao atualizar perfil");
      }
    } catch (err) {
      toast.error("Erro de conexão");
    } finally {
      setLoading(false);
    }
  };

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin h-8 w-8 text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 bg-background/60 backdrop-blur-xl border-b border-border/10 py-4 px-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => router.back()}
            className="rounded-full h-11 px-4 gap-2 border border-border/10 cursor-pointer text-muted-foreground hover:text-primary hover:bg-primary/5 transition-all"
          >
            <ChevronLeft size={20} />
            <span className="text-sm font-bold uppercase tracking-widest">Voltar</span>
          </Button>
          <h1 className="font-display font-bold text-xl text-primary border-l border-border/10 pl-4 py-1">Meu Perfil</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-6 py-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          <div className="flex items-center gap-6 p-6 rounded-[2rem] bg-card border border-border/40 shadow-sm relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl -z-10" />
            <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center text-primary text-2xl font-bold border-2 border-primary/20">
              {session.user?.name?.[0]?.toUpperCase()}
            </div>
            <div>
              <h2 className="text-2xl font-display font-bold text-foreground">{session.user?.name}</h2>
              <p className="text-muted-foreground text-sm">{session.user?.email}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-6">
              <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <User size={14} /> Dados Pessoais
              </h3>
              
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="name" className="text-[10px] uppercase font-bold tracking-wider ml-1 text-muted-foreground">Nome Completo</Label>
                  <Input id="name" name="name" defaultValue={session.user?.name || ""} className="h-12 rounded-xl bg-card border-border/40" />
                </div>
                
                <div className="space-y-1.5">
                  <Label htmlFor="phone" className="text-[10px] uppercase font-bold tracking-wider ml-1 text-muted-foreground">WhatsApp</Label>
                  <Input id="phone" name="phone" defaultValue={session.user?.phone || ""} placeholder="(00) 00000-0000" className="h-12 rounded-xl bg-card border-border/40" />
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <MapPin size={14} /> Endereço de Entrega
              </h3>
              
              <div className="grid gap-4">
                <div className="grid grid-cols-4 gap-3">
                  <div className="col-span-3 space-y-1.5">
                    <Label htmlFor="street" className="text-[10px] uppercase font-bold tracking-wider ml-1 text-muted-foreground">Rua</Label>
                    <Input id="street" name="street" defaultValue={session.user?.street || ""} className="h-12 rounded-xl bg-card border-border/40" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="number" className="text-[10px] uppercase font-bold tracking-wider ml-1 text-muted-foreground">Nº</Label>
                    <Input id="number" name="number" defaultValue={session.user?.number || ""} className="h-12 rounded-xl bg-card border-border/40" />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="neighborhood" className="text-[10px] uppercase font-bold tracking-wider ml-1 text-muted-foreground">Bairro</Label>
                    <Input id="neighborhood" name="neighborhood" defaultValue={session.user?.neighborhood || ""} className="h-12 rounded-xl bg-card border-border/40" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="reference" className="text-[10px] uppercase font-bold tracking-wider ml-1 text-muted-foreground">Referência</Label>
                    <Input id="reference" name="reference" defaultValue={session.user?.reference || ""} placeholder="Perto de..." className="h-12 rounded-xl bg-card border-border/40" />
                  </div>
                </div>
              </div>
            </div>

            <Button 
              type="submit" 
              disabled={loading}
              className="w-full h-14 rounded-2xl bg-primary text-white font-bold uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-[1.01] active:scale-95 transition-all cursor-pointer"
            >
              {loading ? <Loader2 className="animate-spin h-5 w-5 mx-auto" /> : (
                <span className="flex items-center gap-2">
                  <Save size={18} /> Salvar Alterações
                </span>
              )}
            </Button>
          </form>
        </motion.div>
      </main>
    </div>
  );
}
