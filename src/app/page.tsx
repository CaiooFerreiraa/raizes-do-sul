import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="px-6 h-20 flex items-center justify-between border-b border-border/50 bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <Link className="flex items-center gap-2 group cursor-pointer" href="/">
          <span className="font-display text-2xl tracking-tight text-primary font-bold group-hover:opacity-80 transition-opacity">Raízes do Sul</span>
        </Link>
        <nav className="flex items-center gap-6 sm:gap-8">
          <Link className="text-sm font-medium hover:text-primary transition-colors cursor-pointer" href="/encomenda">
            Nossas Massas
          </Link>
          <Link className="text-sm font-medium hover:text-primary transition-colors cursor-pointer text-muted-foreground" href="/login">
            Área Admin
          </Link>
        </nav>
      </header>
      <main className="flex-1">
        <section className="w-full py-16 md:py-24 lg:py-32 xl:py-40 px-6 bg-secondary/30 relative overflow-hidden flex flex-col items-center justify-center min-h-[500px]">
          <div className="absolute inset-0 z-0">
            <Image
              src="/IMG_20260219_233217_505-1.webp"
              alt="Fundo Natural"
              fill
              className="object-cover opacity-25 mix-blend-multiply"
              priority
            />
            <div className="absolute inset-0 bg-background/50 backdrop-blur-[2px]" />
          </div>
          <div className="container relative z-10 px-4 md:px-6">
            <div className="flex flex-col items-center space-y-8 text-center">
              <div className="space-y-4 max-w-3xl">
                <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-foreground">
                  Tradição e sabor em cada fatia
                </h1>
                <p className="mx-auto max-w-[700px] text-foreground md:text-xl font-medium leading-relaxed">
                  Encomende massas e doces artesanais, preparados com receitas de família. Conecte-se com as raízes do sabor.
                </p>
              </div>
              <div className="flex space-x-4">
                <Link href="/encomenda">
                  <Button size="lg" className="h-12 px-8 font-medium cursor-pointer rounded-full hover:scale-105 transition-transform">
                    Fazer Encomenda
                  </Button>
                </Link>
                <Button variant="outline" size="lg" className="h-12 px-8 font-medium cursor-pointer rounded-full bg-background/20 backdrop-blur-sm border-primary/20 hover:bg-primary/5 text-primary">
                  Saber mais
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section className="w-full py-20 md:py-32 bg-background flex flex-col items-center justify-center">
          <div className="container px-4 md:px-6">
            <h2 className="font-display text-3xl font-bold tracking-tight mb-12 text-center text-foreground">Nossos Destaques</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((item) => (
                <div key={item} className="group flex flex-col cursor-pointer border border-border/50 bg-card rounded-3xl p-5 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                  <div className="aspect-[4/5] bg-secondary/80 rounded-2xl mb-6 overflow-hidden relative">
                    <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/5 transition-colors duration-500" />
                  </div>
                  <div className="px-2 pb-2">
                    <h3 className="font-display text-2xl font-semibold mb-2 group-hover:text-primary transition-colors text-foreground">Bolo Artesanal {item}</h3>
                    <p className="text-muted-foreground text-sm flex-1 leading-relaxed">Feito diariamente com ingredientes selecionados, receita de família e muito carinho.</p>
                    <p className="text-primary mt-4 font-bold text-lg">R$ 45,00</p>
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
