import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/header";
import { prisma } from "@/infrastructure/database/prisma";
import { ShoppingBag, ArrowRight, Star, Clock, MapPin } from "lucide-react";

interface Product {
  id: string;
  name: string;
  price: string | number;
  description: string | null;
  imageUrl: string | null;
}

export default async function Home() {
  const dbProducts = await prisma.product.findMany({
    take: 8,
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
    <div className="flex flex-col min-h-screen bg-background text-foreground selection:bg-primary/20">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative w-full min-h-[85vh] flex flex-col items-center justify-center px-4 overflow-hidden bg-secondary/10">
          {/* Background Elements */}
          <div className="absolute inset-0 z-0 flex items-center justify-center">
             <Image
              src="/logo.webp"
              alt="Background"
              width={800}
              height={800}
              className="object-contain opacity-[0.18] scale-100 transition-opacity duration-1000"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background" />
          </div>

          <div className="container relative z-10 max-w-6xl mx-auto flex flex-col items-center text-center space-y-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold uppercase tracking-[0.2em] animate-in fade-in slide-in-from-top-4 duration-700">
              <Star size={12} className="fill-primary" /> Tradição e Sabor Artesanal
            </div>
            
            <div className="space-y-6 max-w-4xl">
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tighter font-display leading-[1.1] animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
                Sabor que vem das <br className="hidden md:block" />
                <span className="text-primary italic relative">
                  Raízes
                  <span className="absolute -bottom-2 left-0 w-full h-2 bg-primary/20 -skew-x-12 -z-10" />
                </span>
              </h1>
              <p className="mx-auto max-w-lg text-muted-foreground text-sm sm:text-base md:text-lg leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
                Massas frescas e cucas artesanais feitas com carinho e a autêntica tradição gaúcha para a sua mesa.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-5 w-full sm:w-auto animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
              <Link href="/encomenda" className="w-full sm:w-auto">
                <Button size="xl" className="h-16 w-full sm:px-10 rounded-[2rem] font-bold text-base uppercase tracking-widest shadow-2xl shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer bg-primary hover:bg-primary/90 text-primary-foreground group">
                  Fazer Encomenda
                  <ShoppingBag className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/loja" className="w-full sm:w-auto">
                <Button variant="outline" size="xl" className="h-16 w-full sm:px-10 rounded-[2rem] font-bold text-base uppercase tracking-widest border-2 border-primary/20 bg-background/50 backdrop-blur-md hover:bg-primary/5 hover:border-primary/40 text-primary transition-all cursor-pointer group">
                  Ver Cardápio
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>

            {/* Quick Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-12 text-sm font-bold uppercase tracking-widest text-muted-foreground/60 animate-in fade-in duration-1000 delay-500">
              <div className="flex items-center gap-3">
                <Clock className="h-4 w-4 text-primary" /> 
                Refeições em Minutos
              </div>
              <div className="flex items-center gap-3">
                <Star className="h-4 w-4 text-primary" /> 
                100% Artesanal
              </div>
            </div>
          </div>
        </section>

        {/* Featured Section */}
        <section className="w-full py-24 md:py-40 bg-background">
          <div className="container max-w-7xl mx-auto px-4 md:px-6">
            <header className="flex flex-col items-center mb-16 space-y-4">
              <span className="text-primary text-[10px] font-bold uppercase tracking-[0.3em]">Seleção Especial</span>
              <h2 className="font-display text-4xl md:text-6xl font-bold tracking-tight text-foreground text-center">Nossos Destaques</h2>
              <div className="h-1.5 w-24 bg-primary/20 rounded-full relative overflow-hidden">
                <div className="absolute inset-0 bg-primary w-1/2 rounded-full" />
              </div>
            </header>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
              {displayProducts.map((product: Product) => (
                <div key={product.id} className="group relative flex flex-col bg-card/40 border border-border/50 rounded-[2.5rem] p-4 hover:border-primary/30 hover:bg-card transition-all duration-500 hover:shadow-2xl hover:shadow-primary/5">
                  <div className="aspect-[4/5] rounded-[2rem] mb-6 overflow-hidden relative shadow-inner">
                    {product.imageUrl ? (
                      <Image 
                        src={product.imageUrl} 
                        alt={product.name} 
                        fill 
                        className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out" 
                      />
                    ) : (
                      <Image 
                        src="/logo.webp" 
                        alt="Logo" 
                        fill 
                        className="object-cover opacity-10 group-hover:opacity-20 transition-opacity" 
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="absolute top-4 right-4 bg-background/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-primary/20 text-[10px] font-bold text-primary shadow-xl">
                      Destaque
                    </div>
                  </div>
                  
                  <div className="px-2 flex flex-col flex-1">
                    <h3 className="font-display text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">{product.name}</h3>
                    <p className="text-muted-foreground text-xs leading-relaxed mb-6 line-clamp-2">
                      {product.description || "Uma receita exclusiva preparada com ingredientes selecionados e o toque tradicional da nossa produção artesanal."}
                    </p>
                    
                    <div className="mt-auto flex items-center justify-between pt-4 border-t border-border/50">
                      <div>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Preço</p>
                        <p className="text-primary font-bold text-lg">R$ {product.price}</p>
                      </div>
                      <Link href={`/encomenda?productId=${product.id}`}>
                        <Button size="icon" className="h-12 w-12 rounded-2xl bg-primary/10 hover:bg-primary text-primary hover:text-primary-foreground transition-all cursor-pointer shadow-none">
                          <ShoppingBag className="h-5 w-5" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-20 text-center">
              <Link href="/loja">
                <Button variant="ghost" className="h-14 px-8 rounded-full font-bold text-sm uppercase tracking-[0.2em] text-muted-foreground hover:text-primary hover:bg-primary/5 cursor-pointer">
                  Ver Todo o Cardápio <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Brand Values */}
        <section className="w-full py-20 bg-secondary/20">
          <div className="container max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 rounded-[2rem] bg-background flex items-center justify-center text-primary shadow-xl border border-primary/10">
                <Star size={24} />
              </div>
              <h4 className="font-display text-xl font-bold">Qualidade Premium</h4>
              <p className="text-sm text-muted-foreground">Ingredientes selecionados para garantir o melhor sabor em cada mordida.</p>
            </div>
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 rounded-[2rem] bg-background flex items-center justify-center text-primary shadow-xl border border-primary/10">
                <Clock size={24} />
              </div>
              <h4 className="font-display text-xl font-bold">Preparo Artesanal</h4>
              <p className="text-sm text-muted-foreground">Tudo feito à mão, com tempo e paciência, como deve ser.</p>
            </div>
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 rounded-[2rem] bg-background flex items-center justify-center text-primary shadow-xl border border-primary/10">
                <ShoppingBag size={24} />
              </div>
              <h4 className="font-display text-xl font-bold">Encomendas Simples</h4>
              <h4 className="sr-only">Facilidade na sua Mesa</h4>
              <p className="text-sm text-muted-foreground">Peça pelo site e receba o melhor da culinária gaúcha em sua casa.</p>
            </div>
          </div>
        </section>
      </main>

      <footer className="w-full pt-20 pb-12 border-t border-border/50 bg-background overflow-hidden relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
        
        <div className="container max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            <div className="md:col-span-2 space-y-6">
              <Link href="/" className="flex items-center gap-3">
                <Image src="/logo.webp" alt="Logo" width={40} height={40} className="rounded-full border border-primary/20" />
                <span className="font-display text-2xl font-bold text-primary">Raízes do Sul</span>
              </Link>
              <p className="text-muted-foreground max-w-sm leading-relaxed">
                Nossa história é escrita com farinha, ovos e muito amor pela culinária tradicional. Uma produção artesanal dedicada a levar o sabor autêntico para sua mesa.
              </p>
            </div>
            <div>
              <h5 className="font-bold text-foreground mb-6 uppercase tracking-widest text-[10px]">Links Rápidos</h5>
              <nav className="flex flex-col gap-4 text-sm font-medium text-muted-foreground">
                <Link href="/encomenda" className="hover:text-primary transition-colors cursor-pointer">Encomendas</Link>
                <Link href="/loja" className="hover:text-primary transition-colors cursor-pointer">Cardápio</Link>
                <Link href="/acompanhar" className="hover:text-primary transition-colors cursor-pointer">Acompanhar Pedido</Link>
              </nav>
            </div>
            <div>
              <h5 className="font-bold text-foreground mb-6 uppercase tracking-widest text-[10px]">Contato</h5>
              <div className="flex flex-col gap-4 text-sm text-muted-foreground">
                <p>Rio Grande do Sul — Brasil</p>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center justify-between pt-8 border-t border-border/20 text-xs text-muted-foreground/60 font-bold uppercase tracking-widest">
            <p>© 2026 Raízes do Sul — Massas Artesanais. Todos os direitos reservados.</p>
            <nav className="flex gap-6 mt-4 sm:mt-0">
              <Link className="hover:text-primary transition-colors cursor-pointer" href="#">Termos</Link>
              <Link className="hover:text-primary transition-colors cursor-pointer" href="#">Privacidade</Link>
            </nav>
          </div>
        </div>
      </footer>
    </div>
  );
}
