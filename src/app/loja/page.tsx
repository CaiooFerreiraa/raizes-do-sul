import { prisma } from "@/infrastructure/database/prisma";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BackButton } from "@/components/ui/back-button";
import { Search } from "lucide-react";
import { Header } from "@/components/header";

interface Product {
  id: string;
  name: string;
  price: string | number;
  description: string | null;
  imageUrl: string | null;
}

const MOCK_PRODUCTS: Product[] = [
  { id: "1", name: "Bolo de Cenoura", price: "35.00", description: "Com calda de chocolate belga.", imageUrl: null },
  { id: "2", name: "Pão de Campanha", price: "22.00", description: "Fermentação natural 24h.", imageUrl: null },
  { id: "3", name: "Focaccia de Alecrim", price: "18.00", description: "Azeite extravirgem e flor de sal.", imageUrl: null },
  { id: "4", name: "Pasta Fresca (500g)", price: "25.00", description: "Feita com ovos caipiras.", imageUrl: null },
  { id: "5", name: "Bolo de Milho", price: "30.00", description: "Receita tradicional da vovó.", imageUrl: null },
  { id: "6", name: "Pão de Milho", price: "15.00", description: "Macio e quentinho.", imageUrl: null },
  { id: "7", name: "Torta de Maçã", price: "45.00", description: "Com canela e crosta crocante.", imageUrl: null },
  { id: "8", name: "Gnocchi de Batata", price: "28.00", description: "Massa leve e artesanal.", imageUrl: null },
];

export default async function ShopPage() {
  const dbProducts = await prisma.product.findMany({
    where: { isAvailable: true },
    orderBy: { name: "asc" }
  });

  const products: Product[] = dbProducts.length > 0
    ? dbProducts.map(p => ({
      id: p.id,
      name: p.name,
      price: p.price.toString(),
      description: p.description,
      imageUrl: p.imageUrl
    }))
    : MOCK_PRODUCTS;

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />

      <main className="flex-1 container px-4 md:px-6 py-8 md:py-12 mx-auto">
        <div className="flex flex-col gap-8 mb-12">
          <div className="flex items-center gap-4">
            <BackButton />
            <div className="max-w-2xl border-l border-border/50 pl-6 py-2">
              <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">Nossa Loja</h1>
              <p className="text-muted-foreground text-sm md:text-base leading-relaxed mt-1">
                Explore nossa seleção de massas frescas, bolos artesanais e delícias preparadas com todo carinho.
              </p>
            </div>
          </div>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-16 border border-border/50 rounded-3xl bg-secondary/10">
            <p className="text-muted-foreground text-base">Em breve, novas delícias estarão por aqui!</p>
          </div>
        ) : (
          <div className="grid gap-4 md:gap-5 grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product: Product) => (
              <div key={product.id} className="group flex flex-col border border-border/50 bg-card rounded-xl md:rounded-2xl p-2 md:p-4 hover:shadow-lg transition-all duration-300">
                <div className="aspect-[4/5] bg-secondary/80 rounded-lg md:rounded-xl mb-3 overflow-hidden relative">
                  {product.imageUrl ? (
                    <Image
                      src={product.imageUrl}
                      alt={product.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center opacity-20">
                      <Image src="/logo.webp" alt="Placeholder" fill className="object-cover" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/5 transition-colors duration-500" />
                </div>
                <div className="px-1 flex flex-col flex-1">
                  <h3 className="font-display text-base md:text-lg font-bold text-foreground line-clamp-1 mb-1">{product.name}</h3>
                  <p className="text-muted-foreground text-[10px] md:text-xs mb-3 line-clamp-2">
                    {product.description || "Ingredientes selecionados e receita artesanal."}
                  </p>
                  <div className="mt-auto pt-2 flex flex-col gap-2">
                    <p className="text-primary font-bold text-sm md:text-base">R$ {product.price.toString()}</p>
                    <Link href={`/encomenda?productId=${product.id}`} className="w-full">
                      <Button size="sm" className="w-full h-8 rounded-full text-[10px] md:text-xs font-bold cursor-pointer">
                        Encomendar
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <footer className="border-t border-border/50 py-12 bg-secondary/10">
        <div className="container px-4 md:px-6 mx-auto text-center">
          <p className="text-muted-foreground">© 2026 Raízes do Sul • Feito com amor e tradição.</p>
        </div>
      </footer>
    </div>
  );
}
