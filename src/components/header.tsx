"use client";

import Link from "next/link";
import Image from "next/image";
import * as React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, ShoppingBag, User, PackageSearch, LayoutDashboard } from "lucide-react";
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
  const { data: session } = useSession();

  React.useEffect(() => {
    setMounted(true);
  }, []);

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
        
        {mounted && session && session?.user?.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL && (
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

        {mounted && session && (
          <div className="flex items-center gap-4 pl-4 border-l border-border/50">
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full bg-primary/5 hover:bg-primary/10 border border-primary/20 p-0 overflow-hidden cursor-pointer">
                      {session.user?.image ? (
                        <Image src={session.user.image} alt={session.user.name || "User"} fill className="object-cover" />
                      ) : (
                        <span className="text-primary font-bold text-sm">
                          {session.user?.name?.[0]?.toUpperCase() || "U"}
                        </span>
                      )}
                    </Button>
                  }
                />
                <DropdownMenuContent align="end" className="w-[200px] rounded-2xl p-2 shadow-xl border-border/50 bg-background">
                  <DropdownMenuGroup>
                    <DropdownMenuLabel className="font-display font-medium px-3 py-2">
                      <p className="text-sm font-bold truncate">{session.user?.name}</p>
                      <p className="text-[10px] text-muted-foreground truncate font-normal">{session.user?.email}</p>
                    </DropdownMenuLabel>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator className="bg-border/50" />
                  <DropdownMenuItem 
                    render={
                      <Link href="/perfil" className="flex items-center gap-2 w-full">
                        <User className="h-4 w-4" />
                        Meu Perfil
                      </Link>
                    }
                    className="cursor-pointer rounded-xl focus:bg-primary/5 focus:text-primary transition-colors py-2.5"
                  />
                  <DropdownMenuItem 
                    className="cursor-pointer rounded-xl focus:bg-destructive/5 focus:text-destructive transition-colors py-2.5 text-muted-foreground"
                    onClick={() => logoutAction()}
                  >
                    Sair da Conta
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
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
          <SheetContent side="right" className="w-[85%] flex flex-col p-6">
            <SheetHeader className="text-left border-b pb-4 mb-4">
              <SheetTitle className="font-display text-2xl text-primary font-bold">Menu</SheetTitle>
            </SheetHeader>
            <nav className="flex flex-col gap-6">
              <SheetClose
                nativeButton={false}
                render={
                  <Link
                    href="/encomenda"
                    className="text-lg font-medium py-2 border-b border-border/50 hover:text-primary transition-colors"
                  >
                    Fazer Encomenda
                  </Link>
                }
              />
              <SheetClose
                nativeButton={false}
                render={
                  <Link
                    href="/acompanhar"
                    className="text-lg font-medium py-2 border-b border-border/50 hover:text-primary transition-colors"
                  >
                    Acompanhar Pedido
                  </Link>
                }
              />
              {mounted && session && session?.user?.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL && (
                <SheetClose
                  nativeButton={false}
                  render={
                    <Link
                      href="/admin"
                      className="text-lg font-medium py-2 border-b border-border/50 hover:text-primary transition-colors flex items-center gap-2"
                    >
                      <LayoutDashboard className="h-5 w-5" />
                      Painel Admin
                    </Link>
                  }
                />
              )}
              {mounted && session && (
                <SheetClose
                  nativeButton={false}
                  render={
                    <Link
                      href="/perfil"
                      className="text-lg font-medium py-2 border-b border-border/50 hover:text-primary transition-colors flex items-center gap-2"
                    >
                      <User className="h-5 w-5" />
                      Meu Perfil
                    </Link>
                  }
                />
              )}
              <SheetClose
                nativeButton={false}
                render={
                  <Link
                    href="/"
                    className="text-lg font-medium py-2 border-b border-border/50 hover:text-primary transition-colors"
                  >
                    Início
                  </Link>
                }
              />
            </nav>

            {mounted && session && (
              <div className="mt-auto space-y-4 pt-6">
                <div className="p-4 rounded-3xl bg-primary/5 border border-primary/10 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg border border-primary/20">
                    {session.user?.name?.[0]?.toUpperCase() || "U"}
                  </div>
                  <div className="overflow-hidden">
                    <p className="font-bold truncate text-primary">{session.user?.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{session.user?.email}</p>
                  </div>
                </div>
                <Button 
                  onClick={() => logoutAction()}
                  variant="destructive" 
                  className="w-full h-14 rounded-2xl font-bold uppercase tracking-widest cursor-pointer shadow-lg shadow-destructive/10"
                >
                  Encerrar Sessão
                </Button>
              </div>
            )}
            
            <div className="mt-6 text-center">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground/40 font-bold">© 2026 Raízes do Sul</p>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
