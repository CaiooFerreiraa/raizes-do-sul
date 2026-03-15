"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, ShoppingBag, User } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from "@/components/ui/sheet";

export function Header() {
  const [isOpen, setIsOpen] = useState(false);

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
      <nav className="hidden md:flex items-center gap-10">
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
          <SheetContent side="right" className="w-[80%] flex flex-col p-6">
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
                    href="/"
                    className="text-lg font-medium py-2 border-b border-border/50 hover:text-primary transition-colors"
                  >
                    Início
                  </Link>
                }
              />
            </nav>
            <div className="mt-auto pt-10 text-center">
              <p className="text-sm text-muted-foreground">© 2026 Raízes do Sul</p>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
