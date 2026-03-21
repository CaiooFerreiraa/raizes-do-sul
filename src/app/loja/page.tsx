import { prisma } from "@/infrastructure/database/prisma";
import { Header } from "@/components/header";
import { BackButton } from "@/components/ui/back-button";
import { ShopProductCard } from "./shop-product-card";
import Link from "next/link";
import type { Decimal } from "@prisma/client/runtime/client";

interface ProductForCard {
  id: string;
  name: string;
  price: string;
  description: string | null;
  imageUrl: string | null;
  images: string[];
  category: string | null;
  flavorCount: number;
  minPrice: string | null;
}

interface DBProduct {
  id: string;
  name: string;
  price: Decimal;
  description: string | null;
  imageUrl: string | null;
  images: string[];
  category: string | null;
  flavors: { price: Decimal }[];
}

interface ShopPageProps {
  searchParams: Promise<{ category?: string }>;
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const { category } = await searchParams;
  
  const dbProducts = await prisma.product.findMany({
    where: { 
      isAvailable: true,
      ...(category && { category }),
    },
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      price: true,
      description: true,
      imageUrl: true,
      images: true,
      category: true,
      flavors: {
        where: { isAvailable: true },
        select: {
          price: true,
        },
      },
    },
  });

  const products: ProductForCard[] = dbProducts.map((p: DBProduct) => {
    const flavorPrices = p.flavors.map((f: { price: Decimal }) => parseFloat(f.price.toString()));
    const minFlavorPrice = flavorPrices.length > 0 ? Math.min(...flavorPrices) : null;
    
    return {
      id: p.id,
      name: p.name,
      price: p.price.toString(),
      description: p.description,
      imageUrl: p.imageUrl,
      images: p.images,
      category: p.category,
      flavorCount: p.flavors.length,
      minPrice: minFlavorPrice !== null ? minFlavorPrice.toFixed(2) : null,
    };
  });

  // Get ALL available categories from all products to show in the filter pills
  const allProductsForCategories = await prisma.product.findMany({
    where: { isAvailable: true },
    select: { category: true }
  });

  const categories = Array.from(
    new Set(allProductsForCategories.map((p: { category: string | null }) => p.category).filter(Boolean) as string[])
  ).sort();

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />

      <main className="flex-1 container px-4 md:px-6 py-8 md:py-10 mx-auto max-w-7xl">
        {/* Cabeçalho da Loja */}
        <div className="flex flex-col gap-4 md:gap-6 mb-6 md:mb-8">
          <div className="flex items-start md:items-center gap-3 md:gap-4">
            <div className="mt-1 md:mt-0">
               <BackButton />
            </div>
            <div className="border-l border-border/30 md:border-border/50 pl-4 md:pl-6 py-1 md:py-2">
              <h1 className="font-display text-xl md:text-3xl font-bold text-foreground leading-tight">
                Nossa Loja
              </h1>
              <p className="text-muted-foreground text-xs md:text-base leading-snug md:leading-relaxed mt-0.5">
                Massas frescas, cucas artesanais e delícias feitas com carinho.
              </p>
            </div>
          </div>

          {/* Filtro por Categoria - Agora com Flex Wrap e Centralizado no Celular */}
          {categories.length > 0 && (
            <div className="flex flex-wrap justify-center gap-2 mb-8">
              <Link 
                href="/loja"
                className={`px-4 py-2 rounded-2xl text-[10px] md:text-[11px] font-bold uppercase tracking-wider transition-all duration-300 ${
                  !category 
                    ? "bg-primary text-white shadow-md" 
                    : "bg-white/50 border border-border/50 text-muted-foreground hover:bg-white hover:text-foreground"
                }`}
              >
                Todos
              </Link>
              {categories.sort().map((cat) => (
                <Link
                  key={cat}
                  href={`/loja?category=${encodeURIComponent(cat)}`}
                  className={`px-4 py-2 rounded-2xl text-[10px] md:text-[11px] font-bold uppercase tracking-wider transition-all duration-300 ${
                    category === cat
                      ? "bg-primary text-white shadow-md"
                      : "bg-white/50 border border-border/50 text-muted-foreground hover:bg-white hover:text-foreground"
                  }`}
                >
                  {cat.slice(0, 1).toUpperCase() + cat.slice(1).toLowerCase()}
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Grid de Produtos */}
        {products.length === 0 ? (
          <div className="text-center py-20 border border-border/50 rounded-3xl bg-secondary/10">
            <div className="text-5xl mb-4">🫙</div>
            <p className="text-muted-foreground text-base font-medium">
              Em breve, novas delícias estarão por aqui!
            </p>
          </div>
        ) : (
          <div className="grid gap-3 md:gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {products.map((product) => (
              <ShopProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </main>

      <footer className="border-t border-border/50 py-10 bg-secondary/10 mt-12">
        <div className="container px-4 md:px-6 mx-auto text-center">
          <p className="text-muted-foreground text-sm">
            © 2026 Raízes do Sul • Feito com amor e tradição.
          </p>
        </div>
      </footer>
    </div>
  );
}
