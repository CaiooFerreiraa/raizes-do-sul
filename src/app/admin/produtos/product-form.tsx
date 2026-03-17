"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createProductAction } from "@/actions/product";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export function ProductForm() {
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    const result = await createProductAction(formData);

    setLoading(false);

    if (result.success) {
      toast.success("Produto adicionado com sucesso!");
      (event.target as HTMLFormElement).reset();
    } else {
      toast.error(result.error || "Erro ao adicionar produto.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name" className="text-muted-foreground ml-1">Nome do Produto</Label>
        <Input id="name" name="name" required className="bg-secondary/20 rounded-2xl h-12 px-4 shadow-inner" placeholder="Pão Fermentação Natural" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="price" className="text-muted-foreground ml-1">Preço (R$)</Label>
        <Input id="price" name="price" required className="bg-secondary/20 rounded-2xl h-12 px-4 shadow-inner" placeholder="45,00" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description" className="text-muted-foreground ml-1">Descrição</Label>
        <Input id="description" name="description" className="bg-secondary/20 rounded-2xl h-12 px-4 shadow-inner" placeholder="Ingredientes ou detalhes do sabor..." />
      </div>
      <div className="space-y-2">
        <Label htmlFor="image" className="text-muted-foreground ml-1">Foto do Produto (Máx 10MB)</Label>
        <Input 
          id="image" 
          name="image" 
          type="file" 
          accept="image/*" 
          className="bg-secondary/20 rounded-2xl h-auto py-3 px-4 shadow-inner cursor-pointer file:cursor-pointer file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:opacity-90" 
        />
      </div>
      <Button type="submit" disabled={loading} className="w-full h-12 rounded-full cursor-pointer mt-4 font-bold text-md hover:scale-[1.02] transition-transform">
        {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
        {loading ? "Adicionando..." : "Adicionar"}
      </Button>
    </form>
  );
}
