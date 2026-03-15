"use client";

import Link from "next/link";
import Image from "next/image";
import * as React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, ShoppingBag, User, PackageSearch, LayoutDashboard, ChevronRight } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { useSession } from "next-auth/react";
import { logoutAction } from "@/actions/auth";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuGroup,
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

export function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { data: session, status } = useSession();
  const isLoading = status === "loading";

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Admin check
  const isAdmin = session?.user?.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL;

  return (
    <header className="px-4 md:px-6 h-20 md:h-24 flex items-center justify-between border-b border-border/50 bg-background/80 backdrop-blur-md sticky top-0 z-50">
      <Link className="flex items-center gap-3 group cursor-pointer" href="/">
        <div className="relative w-10 h-10 md:w-12 md:h-12 rounded-full overflow-hidden border border-primary/20 bg-primary/5">
          <Image
            src="/logo.webp"
            alt="Raízes do Sul Logo"
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-500"
          />
        </div>
        <span className="font-display text-xl md:text-2xl tracking-tight text-primary font-bold group-hover:opacity-80 transition-opacity whitespace-nowrap">
          Raízes do Sul
        </span>
      </Link>

      {/* Desktop Navigation */}
      <nav className="hidden md:flex items-center gap-8">
        <div className="flex items-center gap-8 pr-8">
          <Link
            className="group flex flex-col items-center gap-1 text-sm font-medium transition-all hover:text-primary cursor-pointer"
            href="/encomenda"
          >
            <div className="p-2.5 rounded-xl bg-primary/5 group-hover:bg-primary/10 group-hover:scale-110 transition-all border border-transparent group-hover:border-primary/20">
              <ShoppingBag className="h-5 w-5 text-primary" />
            </div>
            <span className="text-[10px] uppercase tracking-widest font-bold opacity-70 group-hover:opacity-100">
              Encomendas
            </span>
          </Link>
          <Link
            className="group flex flex-col items-center gap-1 text-sm font-medium transition-all hover:text-primary cursor-pointer"
            href="/acompanhar"
          >
            <div className="p-2.5 rounded-xl bg-primary/5 group-hover:bg-primary/10 group-hover:scale-110 transition-all border border-transparent group-hover:border-primary/20">
              <PackageSearch className="h-5 w-5 text-primary" />
            </div>
            <span className="text-[10px] uppercase tracking-widest font-bold opacity-70 group-hover:opacity-100">
              Acompanhar
            </span>
          </Link>
          
          {mounted && session && isAdmin && (
            <Link
              className="group flex flex-col items-center gap-1 text-sm font-medium transition-all hover:text-primary cursor-pointer"
              href="/admin"
            >
              <div className="p-2.5 rounded-xl bg-primary/5 group-hover:bg-primary/10 group-hover:scale-110 transition-all border border-transparent group-hover:border-primary/20">
                <LayoutDashboard className="h-5 w-5 text-primary" />
              </div>
              <span className="text-[10px] uppercase tracking-widest font-bold opacity-70 group-hover:opacity-100">
                Admin
              </span>
            </Link>
          )}
        </div>

        {mounted && !isLoading && (
          <div className="flex items-center gap-4 pl-8 border-l border-border/50">
            {!session ? (
              <Link href="/login">
                <Button 
                  variant="ghost" 
                  className="h-10 px-8 rounded-full bg-primary/5 hover:bg-primary/10 border border-primary/20 text-primary font-bold text-[10px] uppercase tracking-[0.15em] cursor-pointer transition-all"
                >
                  Log In
                </Button>
              </Link>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button variant="ghost" className="relative h-12 w-12 rounded-full bg-primary/5 hover:bg-primary/10 border border-primary/20 p-0 overflow-hidden cursor-pointer shadow-sm hover:shadow-md transition-all">
                      {session.user?.image ? (
                        <Image src={session.user.image} alt={session.user.name || "User"} fill className="object-cover" />
                      ) : (
                        <span className="text-primary font-bold text-base">
                          {session.user?.name?.[0]?.toUpperCase() || "U"}
                        </span>
                      )}
                    </Button>
                  }
                />
                <DropdownMenuContent align="end" className="w-[240px] rounded-[2rem] p-3 shadow-2xl border-border/30 bg-background/95 backdrop-blur-md mt-2">
                  <DropdownMenuGroup>
                    <DropdownMenuLabel className="font-display px-4 py-3">
                      <p className="text-base font-bold text-primary truncate">{session.user?.name}</p>
                      <p className="text-[10px] text-muted-foreground truncate font-bold uppercase tracking-wider">{session.user?.email}</p>
                    </DropdownMenuLabel>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator className="bg-border/30 my-2" />
                  <DropdownMenuItem 
                    render={
                      <Link href="/perfil" className="flex items-center gap-3 w-full">
                        <User className="h-4 w-4" />
                        Meu Perfil
                      </Link>
                    }
                    className="cursor-pointer rounded-2xl focus:bg-primary/5 focus:text-primary transition-colors py-3 px-4 font-medium"
                  />
                  {isAdmin && (
                    <DropdownMenuItem 
                      render={
                        <Link href="/admin" className="flex items-center gap-3 w-full">
                          <LayoutDashboard className="h-4 w-4" />
                          Painel Administrativo
                        </Link>
                      }
                      className="cursor-pointer rounded-2xl focus:bg-primary/5 focus:text-primary transition-colors py-3 px-4 font-medium"
                    />
                  )}
                  <DropdownMenuSeparator className="bg-border/30 my-2" />
                  <DropdownMenuItem 
                    className="cursor-pointer rounded-2xl focus:bg-destructive/5 focus:text-destructive transition-colors py-3 px-4 text-muted-foreground font-medium"
                    onClick={() => logoutAction()}
                  >
                    Encerrar Sessão
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        )}
      </nav>

      {/* Mobile Navigation (Hamburger) */}
      <div className="md:hidden">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger
            nativeButton={true}
            render={
              <Button variant="ghost" size="icon" className="cursor-pointer text-foreground h-10 w-10">
                <Menu className="h-8 w-8" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            }
          />
          <SheetContent side="right" className="w-[85%] flex flex-col p-8 border-l-primary/10">
            <SheetHeader className="text-left border-b border-border/30 pb-6 mb-2">
              <SheetTitle className="font-display text-3xl text-primary font-bold">Navegação</SheetTitle>
            </SheetHeader>
            <nav className="flex flex-col gap-2">
              {[
                { label: "Fazer Encomenda", href: "/encomenda", icon: ShoppingBag },
                { label: "Acompanhar Pedido", href: "/acompanhar", icon: PackageSearch },
                { label: "Início", href: "/", icon: null }
              ].map((item) => (
                <SheetClose
                  key={item.href}
                  nativeButton={false}
                  render={
                    <Link
                      href={item.href}
                      className="text-lg font-bold py-4 border-b border-border/20 hover:text-primary transition-colors flex items-center justify-between group"
                    >
                      <span>{item.label}</span>
                      <ChevronRight size={18} className="opacity-0 group-hover:opacity-100 transition-all text-primary" />
                    </Link>
                  }
                />
              ))}
            </nav>

            {mounted && !isLoading && (
              <div className="mt-auto space-y-6">
                {!session ? (
                  <Link href="/login" className="w-full block">
                    <Button 
                      className="w-full h-16 rounded-[1.5rem] font-bold uppercase tracking-widest cursor-pointer shadow-xl shadow-primary/10 transition-all active:scale-95 bg-primary hover:bg-primary/90 text-primary-foreground text-sm"
                    >
                      Acessar Conta
                    </Button>
                  </Link>
                ) : (
                  <div className="space-y-4">
                    <div className="p-5 rounded-[2rem] bg-primary/5 border border-primary/10 flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl border border-primary/20">
                        {session.user?.name?.[0]?.toUpperCase() || "U"}
                      </div>
                      <div className="overflow-hidden">
                        <p className="font-bold truncate text-primary leading-tight">{session.user?.name}</p>
                        <p className="text-[10px] text-muted-foreground truncate font-bold uppercase tracking-wider">{session.user?.email}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                       <SheetClose nativeButton={false} render={
                         <Link href="/perfil" className="flex items-center justify-center gap-2 h-14 rounded-2xl bg-secondary/30 text-[10px] font-bold uppercase tracking-widest text-primary">
                           <User size={14} /> Perfil
                         </Link>
                       } />
                       <Button 
                        onClick={() => logoutAction()}
                        variant="ghost" 
                        className="flex items-center justify-center gap-2 h-14 rounded-2xl border border-destructive/20 text-destructive text-[10px] font-bold uppercase tracking-widest hover:bg-destructive/5"
                      >
                        Sair
                      </Button>
                    </div>
                    {isAdmin && (
                      <SheetClose nativeButton={false} render={
                        <Link href="/admin" className="flex items-center justify-center gap-2 h-14 rounded-2xl bg-primary text-white text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-primary/10">
                          <LayoutDashboard size={14} /> Painel Admin
                        </Link>
                      } />
                    )}
                  </div>
                )}
                
                <div className="text-center pt-2">
                  <p className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground/40 font-bold italic">© 2026 Raízes do Sul — Massas Artesanais</p>
                </div>
              </div>
            )}
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
