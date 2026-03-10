import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { prisma } from "@/infrastructure/database/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function AdminDashboard() {
  const productsCount = await prisma.product.count();
  const ordersCount = await prisma.order.count();

  return (
    <div className="space-y-10 max-w-5xl mx-auto">
      <div>
        <h1 className="font-display text-4xl sm:text-5xl font-bold text-foreground">Visão Geral</h1>
        <p className="text-muted-foreground mt-3 text-lg">Bem-vindo(a) ao painel orgânico.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="rounded-[2rem] border-border/70 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
          <CardHeader className="pb-2">
            <CardTitle className="font-display text-2xl text-foreground">Produtos Cadastrados</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-display text-5xl font-bold text-primary mb-2">{productsCount}</p>
            <CardDescription className="text-sm">Total de itens no catálogo</CardDescription>
          </CardContent>
        </Card>

        <Card className="rounded-[2rem] border-border/70 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
          <CardHeader className="pb-2">
            <CardTitle className="font-display text-2xl text-foreground">Encomendas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-display text-5xl font-bold text-primary mb-2">{ordersCount}</p>
            <CardDescription className="text-sm">Total de pedidos recebidos</CardDescription>
          </CardContent>
        </Card>
      </div>

      <div className="mt-12 flex flex-col md:flex-row gap-4 border-t border-border/50 pt-10">
        <Link href="/admin/produtos">
          <Button className="cursor-pointer rounded-full h-12 w-full md:w-auto px-8 shadow-sm">
            Gerenciar Produtos
          </Button>
        </Link>
      </div>
    </div>
  )
}
