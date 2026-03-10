import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { logoutAction } from "@/actions/auth";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from "@/components/ui/sheet";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session) {
    redirect("/login");
  }

  const NavLinks = () => (
    <nav className="space-y-3">
      <Link href="/admin" className="block p-3 rounded-2xl bg-card shadow-sm border border-border/50 font-medium text-primary cursor-pointer hover:bg-secondary/40 transition-colors">
        <span className="font-display text-lg">Painel</span>
      </Link>
      <Link href="/admin/produtos" className="block p-3 rounded-2xl font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/40 transition-colors cursor-pointer">
        <span className="font-display text-lg">Produtos</span>
      </Link>
      <Link href="/admin/pedidos" className="block p-3 rounded-2xl font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/40 transition-colors cursor-pointer">
        <span className="font-display text-lg">Encomendas</span>
      </Link>
    </nav>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar Desktop */}
      <aside className="w-64 border-r border-border/50 bg-secondary/10 p-6 flex flex-col justify-between hidden md:flex">
        <div>
          <Link href="/" className="font-display text-3xl font-bold cursor-pointer hover:text-primary transition-colors block text-center mb-12 text-foreground">
            Admin.
          </Link>
          <NavLinks />
        </div>

        <form action={logoutAction}>
          <Button type="submit" variant="ghost" className="w-full justify-start cursor-pointer hover:bg-destructive/10 hover:text-destructive transition-colors text-muted-foreground text-md">
            Sair da conta
          </Button>
        </form>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Mini Header */}
        <header className="h-16 flex items-center justify-between px-4 border-b border-border/30 md:hidden bg-background">
          <Link href="/admin" className="flex items-center gap-2 group">
            <div className="relative w-8 h-8 rounded-full overflow-hidden border border-primary/20">
              <Image src="/logo.webp" alt="Logo" fill className="object-cover" />
            </div>
            <span className="font-display text-xl font-bold text-primary">Admin</span>
          </Link>
          <Sheet>
            <SheetTrigger nativeButton={true} render={<Button variant="ghost" size="icon"><Menu className="h-6 w-6" /></Button>} />
            <SheetContent side="left" className="w-[80%] p-6 flex flex-col h-full">
              <SheetHeader className="mb-8 border-b pb-4">
                <SheetTitle className="font-display text-2xl text-primary font-bold text-left">Navegação</SheetTitle>
              </SheetHeader>
              <div className="flex-1">
                <NavLinks />
              </div>
              <form action={logoutAction} className="mt-auto border-t pt-4">
                <Button type="submit" variant="outline" className="w-full rounded-full border-destructive/20 text-destructive">Sair</Button>
              </form>
            </SheetContent>
          </Sheet>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-10 bg-secondary/5 md:rounded-l-[3rem] border-l border-border/30 shadow-inner">
          {children}
        </main>
      </div>
    </div>
  )
}
