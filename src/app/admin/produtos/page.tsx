import { prisma } from "@/infrastructure/database/prisma";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createProductAction } from "@/actions/product";
import { DeleteButton } from "./delete-button";
import { BackButton } from "@/components/ui/back-button";
import Image from "next/image";

export default async function AdminProducts() {
  const products = await prisma.product.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div className="max-w-7xl mx-auto space-y-8 md:space-y-12">
      <div className="flex items-center gap-6">
        <BackButton />
        <div className="border-l border-border/50 pl-6 py-2">
          <h1 className="font-display text-3xl sm:text-5xl font-bold text-foreground">Produtos</h1>
          <p className="text-muted-foreground mt-1 text-md md:text-lg">Gestão de Massas, Cucas e Delícias Artesanais.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-1 border border-border/50 bg-card rounded-[2.5rem] p-8 shadow-sm h-fit">
          <h2 className="font-display text-2xl font-semibold mb-6 text-foreground">Novo Produto</h2>
          <form action={createProductAction} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-muted-foreground ml-1">Nome do Produto</Label>
              <Input id="name" name="name" required className="bg-secondary/20 rounded-2xl h-12 px-4 shadow-inner" placeholder="Pão Fermentação Natural" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price" className="text-muted-foreground ml-1">Preço (R$)</Label>
              <Input id="price" name="price" required className="bg-secondary/20 rounded-2xl h-12 px-4 shadow-inner" placeholder="45.00" />
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
            <Button type="submit" className="w-full h-12 rounded-full cursor-pointer mt-4 font-bold text-md hover:scale-[1.02] transition-transform">
              Adicionar
            </Button>
          </form>
        </div>

        <div className="lg:col-span-2 border border-border/50 bg-card rounded-[2.5rem] shadow-sm overflow-hidden p-8 min-h-[500px]">
          <h2 className="font-display text-2xl font-semibold mb-6 text-foreground">Seu Catálogo</h2>
          {products.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-10 h-full text-center space-y-4">
              <p className="text-muted-foreground italic text-lg opacity-60">Nenhum produto cadastrado ainda.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {products.map((product: any) => (
                <div key={product.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-5 border border-border/70 rounded-3xl hover:border-primary/20 hover:bg-secondary/5 transition-all duration-300">
                  <div className="flex items-center gap-4">
                    <div className="relative w-16 h-16 rounded-2xl overflow-hidden bg-secondary/20 border border-border/50 flex-shrink-0">
                      {product.imageUrl ? (
                        <Image 
                          src={product.imageUrl} 
                          alt={product.name} 
                          fill 
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground/40 italic text-[10px] text-center p-1">
                          Sem foto
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="font-display text-2xl font-semibold text-foreground">{product.name}</h3>
                      {product.description && <p className="text-sm text-muted-foreground mt-1 line-clamp-1">{product.description}</p>}
                      <p className="text-primary mt-1 font-bold text-lg">R$ {product.price.toString()}</p>
                    </div>
                  </div>
                  <div className="mt-4 sm:mt-0">
                    <DeleteButton id={product.id} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
