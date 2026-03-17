import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { logoutAction } from "@/actions/auth";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { SidebarNav } from "@/components/admin/sidebar-nav";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  
  const isAdmin = session?.user?.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL;

  if (!session || !isAdmin) {
    redirect("/");
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar Desktop */}
      <aside className="w-72 border-r border-border/50 bg-secondary/10 p-8 flex flex-col justify-between hidden md:flex">
        <div className="space-y-12">
          <Link href="/" className="font-display text-3xl font-bold cursor-pointer hover:text-primary transition-colors block text-center text-foreground">
            Admin.
          </Link>
          <SidebarNav />
        </div>

        <div className="space-y-6">
          <div className="px-4 py-4 rounded-3xl bg-card border border-border/40 shadow-sm">
            <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest mb-2 ml-1">Usuário</p>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                {session.user?.name?.[0] || "A"}
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-bold truncate">{session.user?.name}</p>
                <p className="text-[10px] text-muted-foreground truncate">{session.user?.email}</p>
              </div>
            </div>
          </div>
          
          <form action={logoutAction}>
            <Button type="submit" variant="ghost" className="w-full justify-start h-12 rounded-2xl cursor-pointer hover:bg-destructive/10 hover:text-destructive transition-colors text-muted-foreground text-sm font-bold uppercase tracking-widest">
              Sair da conta
            </Button>
          </form>
        </div>
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
            <SheetContent side="left" className="w-[85%] p-6 flex flex-col h-full">
              <SheetHeader className="mb-8 border-b pb-6">
                <SheetTitle className="font-display text-2xl text-primary font-bold text-left">Navegação Admin</SheetTitle>
              </SheetHeader>
              
              <div className="flex-1 space-y-8">
                <div className="p-4 rounded-3xl bg-secondary/20 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg">
                    {session.user?.name?.[0] || "A"}
                  </div>
                  <div className="overflow-hidden">
                    <p className="font-bold truncate">{session.user?.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{session.user?.email}</p>
                  </div>
                </div>
                
                <SidebarNav />
              </div>
              
              <form action={logoutAction} className="mt-auto pt-6 border-t border-border/50">
                <Button type="submit" variant="destructive" className="w-full h-12 rounded-2xl font-bold uppercase tracking-widest cursor-pointer">
                  Encerrar Sessão
                </Button>
              </form>
            </SheetContent>
          </Sheet>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-12 bg-background md:rounded-tl-[3rem] border-l border-border/30 relative z-10">
          {children}
        </main>
      </div>
    </div>
  )
}
