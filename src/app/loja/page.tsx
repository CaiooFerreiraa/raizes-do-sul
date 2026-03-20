import { prisma } from "@/infrastructure/database/prisma";
import Image from "next/image";
import Link from "next/link";
import { Header } from "@/components/header";
import { BackButton } from "@/components/ui/back-button";
import { ShopProductCard } from "./shop-product-card";

interface ProductForCard {
  id: string;
  name: string;
  price: string;
  description: string | null;
  imageUrl: string | null;
  images: string[];
  variantName: string | null;
  category: string | null;
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
      variantName: true,
      category: true,
    },
  });

  const products: ProductForCard[] = dbProducts.map((p: { id: string; name: string; price: { toString(): string }; description: string | null; imageUrl: string | null; images: string[]; variantName: string | null; category: string | null; }) => ({
    id: p.id,
    name: p.name,
    price: p.price.toString(),
    description: p.description,
    imageUrl: p.imageUrl,
    images: p.images,
    variantName: p.variantName,
    category: p.category,
  }));

  const categories = Array.from(
    new Set(products.map((p) => p.category).filter(Boolean) as string[])
  );

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />

      <main className="flex-1 container px-4 md:px-6 py-8 md:py-10 mx-auto max-w-7xl">
        {/* Cabeçalho da Loja */}
        <div className="flex flex-col gap-6 mb-8">
          <div className="flex items-center gap-4">
            <BackButton />
            <div className="border-l border-border/50 pl-6 py-2">
              <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">
                Nossa Loja
              </h1>
              <p className="text-muted-foreground text-sm md:text-base leading-relaxed mt-1">
                Massas frescas, cucas artesanais e delícias feitas com carinho.
              </p>
            </div>
          </div>

          {/* Filtro por Categoria */}
          {categories.length > 0 && (
            <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
              <Link 
                href="/loja"
                className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${
                  !category 
                    ? "bg-primary text-primary-foreground" 
                    : "border border-border/60 text-muted-foreground hover:border-primary/60 hover:text-foreground"
                }`}
              >
                Todos
              </Link>
              {categories.map((cat) => (
                <Link
                  key={cat}
                  href={`/loja?category=${encodeURIComponent(cat)}`}
                  className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    category === cat
                      ? "bg-primary text-primary-foreground"
                      : "border border-border/60 text-muted-foreground hover:border-primary/60 hover:text-foreground"
                  }`}
                >
                  {cat}
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
