import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/header";
import { prisma } from "@/infrastructure/database/prisma";

interface Product {
  id: string;
  name: string;
  price: string | number;
  description: string | null;
  imageUrl: string | null;
}

export default async function Home() {
  const dbProducts = await prisma.product.findMany({
    take: 10,
    where: { isAvailable: true },
    orderBy: { createdAt: "desc" }
  });

  const displayProducts: Product[] = dbProducts.map((p: any) => ({
    id: p.id,
    name: p.name,
    price: p.price.toString(),
    description: p.description,
    imageUrl: p.imageUrl
  }));

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header />
      <main className="flex-1">
        <section className="w-full py-20 md:py-32 lg:py-40 px-4 md:px-6 bg-secondary/30 relative overflow-hidden flex flex-col items-center justify-center min-h-[500px] md:min-h-[600px]">
          <div className="absolute inset-0 z-0 text-center">
            <Image
              src="/logo.webp"
              alt="Fundo Natural"
              fill
              className="object-cover opacity-10 blur-[2px]"
              priority
            />
          </div>

          <div className="container relative z-10 flex items-center justify-center">
            <div className="flex flex-col items-center space-y-10 md:space-y-12 text-center">
              <div className="space-y-4 md:space-y-8">
                <h1 className="text-[2.5rem] sm:text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter font-display max-w-4xl leading-[1.1]">
                  Sabor que vem das <span className="text-primary italic">Raízes</span>
                </h1>
                <p className="mx-auto max-w-[700px] text-muted-foreground text-sm sm:text-lg md:text-2xl leading-relaxed px-4 md:px-0">
                  Massas frescas e bolos artesanais feitos com carinho e tradição gaúcha.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto px-6 sm:px-0">
                <Link href="/encomenda" className="w-full sm:w-auto">
                  <Button size="lg" className="h-14 sm:h-12 w-full sm:px-8 font-bold cursor-pointer rounded-full hover:scale-105 transition-transform text-base sm:text-sm uppercase tracking-widest shadow-lg shadow-primary/20">
                    Fazer Encomenda
                  </Button>
                </Link>
                <Link href="/loja" className="w-full sm:w-auto">
                  <Button variant="outline" size="lg" className="h-14 sm:h-12 w-full sm:px-8 font-bold cursor-pointer rounded-full bg-background/40 backdrop-blur-sm border-primary/20 hover:bg-primary/5 text-primary text-base sm:text-sm uppercase tracking-widest">
                    Conhecer produtos
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-32 bg-background flex flex-col items-center justify-center">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center mb-12">
              <h2 className="font-display text-2xl md:text-4xl font-bold tracking-tight text-foreground text-center">Nossos Destaques</h2>
              <div className="h-1 w-20 bg-primary mt-4 rounded-full" />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-5">
              {displayProducts.map((product: Product) => (
                <div key={product.id} className="group flex flex-col border border-border/50 bg-card rounded-xl md:rounded-2xl p-2 md:p-3 hover:shadow-lg transition-all duration-300">
                  <div className="aspect-[1/1] rounded-lg md:rounded-xl mb-3 overflow-hidden relative">
                    {product.imageUrl ? (
                      <Image src={product.imageUrl} alt={product.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <Image src="/logo.webp" alt="Logo" fill className="object-cover opacity-20" />
                    )}
                    <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/5 transition-colors duration-500" />
                  </div>
                  <div className="px-1 flex flex-col flex-1">
                    <h3 className="font-display text-sm md:text-base font-bold text-foreground line-clamp-1 mb-1">{product.name}</h3>
                    <p className="text-muted-foreground text-[10px] md:text-xs flex-1 leading-tight line-clamp-2 mb-2">
                      {product.description || "Ingrediente selecionado e receita artesanal."}
                    </p>
                    <div className="mt-auto flex flex-col gap-2">
                      <p className="text-primary font-bold text-xs md:text-sm">R$ {product.price.toString()}</p>
                      <Link href={`/encomenda?productId=${product.id}`}>
                        <Button size="sm" className="h-7 md:h-8 w-full rounded-full px-2 text-[9px] md:text-[10px] font-bold cursor-pointer">
                          Encomendar
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="w-full py-12 border-t border-border/50 flex flex-col items-center justify-center px-6 text-sm text-muted-foreground bg-secondary/10">
        <div className="container flex flex-col sm:flex-row items-center justify-between">
          <p>© 2026 Raízes do Sul. CNPJ: XX.XXX.XXX/0001-XX</p>
          <nav className="flex gap-4 sm:gap-6 mt-4 sm:mt-0">
            <Link className="hover:text-primary transition-colors cursor-pointer" href="#">
              Política de Privacidade
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
