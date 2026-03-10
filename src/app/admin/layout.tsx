import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { logoutAction } from "@/actions/auth";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session) {
    redirect("/login");
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <aside className="w-64 border-r border-border/50 bg-secondary/10 p-6 flex flex-col justify-between hidden md:flex">
        <div>
          <Link href="/" className="font-display text-3xl font-bold cursor-pointer hover:text-primary transition-colors block text-center mb-12 text-foreground">
            Admin.
          </Link>
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
        </div>

        <form action={logoutAction}>
          <Button type="submit" variant="ghost" className="w-full justify-start cursor-pointer hover:bg-destructive/10 hover:text-destructive transition-colors text-muted-foreground text-md">
            Sair da conta
          </Button>
        </form>
      </aside>

      <main className="flex-1 overflow-y-auto p-4 md:p-10 bg-secondary/5 rounded-l-[3rem] border-l border-border/30 shadow-inner">
        {children}
      </main>
    </div>
  )
}
