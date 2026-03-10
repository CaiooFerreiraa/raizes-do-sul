"use client"

import { loginAction } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useActionState, useState } from "react";
import { Loader2 } from "lucide-react";
import { BackButton } from "@/components/ui/back-button";

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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
      }
    } catch (e) {
      console.error(e);
      // Wait, nextjs redirect throws so we don't catch it and clear loading state here normally
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('/IMG_20260219_233217_505-1.webp')] bg-cover bg-center mix-blend-multiply opacity-5 blur-sm" />
      <div className="w-full max-w-sm border border-border/50 bg-card rounded-[2rem] p-8 sm:p-10 shadow-lg relative z-10 transition-transform">
        <BackButton />
        <h1 className="font-display text-4xl font-bold text-center mb-10 text-foreground">Admin</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email" className="font-medium text-muted-foreground ml-1">E-mail</Label>
            <Input id="email" name="email" type="email" placeholder="admin@raizesdosul.com" required className="h-12 rounded-xl bg-secondary/50 border-transparent focus-visible:ring-primary focus-visible:border-primary px-4 cursor-text" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="font-medium text-muted-foreground ml-1">Senha</Label>
            <Input id="password" name="password" type="password" required className="h-12 rounded-xl bg-secondary/50 border-transparent focus-visible:ring-primary focus-visible:border-primary px-4 cursor-text" />
          </div>
          {error && <p className="text-destructive font-semibold text-sm text-center">{error}</p>}
          <Button type="submit" disabled={loading} className="w-full h-12 rounded-full cursor-pointer font-bold text-md mt-4 shadow-sm hover:translate-y-[-2px] transition-transform active:translate-y-[1px]">
            {loading ? <Loader2 className="animate-spin w-5 h-5 mx-auto text-primary-foreground" /> : "Entrar"}
          </Button>
        </form>
      </div>
    </div>
  );
}
