import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
// Re-compile trigger: 2026-03-21T20:43:00-03:00
import { prisma } from "@/infrastructure/database/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { TrendingUp, Package, ShoppingBag, BarChart3, Star, Clock, AlertCircle, CheckCircle2 } from "lucide-react";

interface OrderItemWithProduct {
  id: string;
  productId: string | null;
  productName: string | null;
  quantity: number;
  price: number | string;
  product: { name: string } | null;
}

interface TopItem {
  name: string;
  quantity: number;
}

export default async function AdminDashboard() {
  const productsCount = await prisma.product.count();
  const ordersCount = await prisma.order.count();

  // Stats for the current month
  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const monthlyOrders = await prisma.order.findMany({
    where: {
      createdAt: {
        gte: firstDayOfMonth,
      },
    },
    include: {
      items: true,
    },
  });

  const monthlyRevenue = monthlyOrders.reduce((acc: number, order: { total: any }) => acc + Number(order.total), 0);
  const averageOrderValue = ordersCount > 0
    ? (await prisma.order.aggregate({ _avg: { total: true } }))._avg.total || 0
    : 0;

  // Best selling products
  let topItems: TopItem[] = [];
  try {
    const allOrderItems = await prisma.orderItem.findMany({
      include: {
        product: {
          select: {
            name: true,
          }
        },
      },
    }) as unknown as OrderItemWithProduct[];

    const productAggregates = allOrderItems.reduce<Record<string, TopItem>>((acc: Record<string, TopItem>, item: OrderItemWithProduct) => {
      const name = item.product?.name || item.productName || "Produto";
      const key = item.productId || name;

      if (!acc[key]) {
        acc[key] = { name, quantity: 0 };
      }
      acc[key].quantity += item.quantity;
      return acc;
    }, {});

    topItems = (Object.values(productAggregates) as TopItem[])
      .sort((a: TopItem, b: TopItem) => b.quantity - a.quantity)
      .slice(0, 5);
  } catch (error) {
    console.error("Erro ao carregar ranking de produtos:", error);
    topItems = [];
  }

  // Daily summary logic
  const todayDate = new Date();
  todayDate.setHours(0, 0, 0, 0);
  const tomorrowDate = new Date(todayDate);
  tomorrowDate.setDate(tomorrowDate.getDate() + 1);
  const dayAfterTomorrow = new Date(tomorrowDate);
  dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);

  let [ordersToday, ordersTomorrow, pendingOrders, completedOrders, pendingPayment] = [0, 0, 0, 0, 0];
  
  try {
    const counts = await Promise.all([
      prisma.order.count({ 
        where: { 
          scheduledDate: { 
            gte: todayDate, 
            lt: tomorrowDate 
          } 
        } 
      }),
      prisma.order.count({ 
        where: { 
          scheduledDate: { 
            gte: tomorrowDate, 
            lt: dayAfterTomorrow 
          } 
        } 
      }),
      prisma.order.count({ 
        where: { 
          status: { 
            in: ["RECEIVED", "CONFIRMED", "PRODUCTION", "PENDING"] 
          } 
        } 
      }),
      prisma.order.count({ 
        where: { 
          status: { 
            in: ["DELIVERED", "COMPLETED"] 
          } 
        } 
      }),
      prisma.order.count({ 
        where: { 
          paymentStatus: "PENDING"
        } 
      }),
    ]);
    [ordersToday, ordersTomorrow, pendingOrders, completedOrders, pendingPayment] = counts;
  } catch (error) {
    console.error("Erro ao carregar resumo operacional:", error);
  }

  return (
    <div className="space-y-12 max-w-6xl mx-auto py-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-8 border-b border-border/20">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-primary font-bold uppercase tracking-[0.2em] text-[10px]">
            <Star size={12} className="fill-primary" /> Painel de Controle
          </div>
          <h1 className="font-display text-5xl md:text-7xl font-bold text-foreground tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground text-lg max-w-xl">Bem-vindo de volta. Aqui está um resumo da operação artesanal hoje.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/admin/pedidos">
            <Button variant="outline" className="rounded-2xl h-14 px-6 border-border/50 hover:bg-primary/5 transition-all group">
              <ShoppingBag className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform" />
              Gestão de Pedidos
            </Button>
          </Link>
          <Link href="/admin/produtos">
            <Button className="rounded-2xl h-14 px-6 shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all bg-primary hover:bg-primary/90 text-primary-foreground">
              <Package className="mr-2 h-4 w-4" />
              Catálogo de Massas
            </Button>
          </Link>
        </div>
      </div>

      {/* Operacional Summary - Redesigned */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: "Hoje", count: ordersToday, icon: Clock, color: "text-primary", bg: "bg-primary/10", border: "border-primary/20" },
          { label: "Amanhã", count: ordersTomorrow, icon: Star, color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/20" },
          { label: "Pendentes", count: pendingOrders, icon: AlertCircle, color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/20" },
          { label: "Pagamentos", count: pendingPayment, icon: ShoppingBag, color: "text-red-500", bg: "bg-red-500/10", border: "border-red-500/20" },
          { label: "Concluídos", count: completedOrders, icon: CheckCircle2, color: "text-green-500", bg: "bg-green-500/10", border: "border-green-500/20" }
        ].map((item) => (
          <div key={item.label} className={`group bg-card border ${item.border} rounded-3xl p-5 flex flex-col items-start justify-between shadow-sm hover:shadow-md transition-all`}>
            <div className={`h-10 w-10 rounded-2xl ${item.bg} flex items-center justify-center ${item.color} mb-4 group-hover:scale-110 transition-transform`}>
              <item.icon size={20} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{item.label}</p>
              <p className="text-3xl font-bold mt-1 tabular-nums">{item.count}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="rounded-[2.5rem] border-border/50 bg-gradient-to-br from-background to-secondary/10 shadow-sm overflow-hidden group">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between mb-2">
              <div className="w-12 h-12 rounded-[1.5rem] bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                <TrendingUp className="h-6 w-6" />
              </div>
              <span className="text-[10px] font-bold text-primary uppercase bg-primary/5 px-2 py-1 rounded-full">Mensal</span>
            </div>
            <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Faturamento Mensal</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-foreground">R$ {monthlyRevenue.toFixed(2).replace(".", ",")}</p>
            <CardDescription className="text-xs mt-2 font-medium">Acumulado em {now.toLocaleDateString('pt-BR', { month: 'long' })}</CardDescription>
          </CardContent>
        </Card>

        <Card className="rounded-[2.5rem] border-border/50 bg-gradient-to-br from-background to-secondary/10 shadow-sm overflow-hidden group">
          <CardHeader className="pb-2">
             <div className="flex items-center justify-between mb-2">
              <div className="w-12 h-12 rounded-[1.5rem] bg-blue-500/10 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
                <BarChart3 className="h-6 w-6" />
              </div>
            </div>
            <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Ticket Médio</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-foreground">R$ {Number(averageOrderValue).toFixed(2).replace(".", ",")}</p>
            <CardDescription className="text-xs mt-2 font-medium">Média por pedido realizado</CardDescription>
          </CardContent>
        </Card>

        <Card className="rounded-[2.5rem] border-border/50 bg-gradient-to-br from-background to-secondary/10 shadow-sm overflow-hidden group">
          <CardHeader className="pb-2">
             <div className="flex items-center justify-between mb-2">
              <div className="w-12 h-12 rounded-[1.5rem] bg-orange-500/10 flex items-center justify-center text-orange-500 group-hover:scale-110 transition-transform">
                <ShoppingBag className="h-6 w-6" />
              </div>
            </div>
            <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Total Encomendas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-foreground tabular-nums">{ordersCount}</p>
            <CardDescription className="text-xs mt-2 font-medium">Histórico total recebido</CardDescription>
          </CardContent>
        </Card>

        <Card className="rounded-[2.5rem] border-border/50 bg-gradient-to-br from-background to-secondary/10 shadow-sm overflow-hidden group">
          <CardHeader className="pb-2">
             <div className="flex items-center justify-between mb-2">
              <div className="w-12 h-12 rounded-[1.5rem] bg-purple-500/10 flex items-center justify-center text-purple-500 group-hover:scale-110 transition-transform">
                <Package className="h-6 w-6" />
              </div>
            </div>
            <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Itens no Catálogo</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-foreground tabular-nums">{productsCount}</p>
            <CardDescription className="text-xs mt-2 font-medium">Produtos artesanais ativos</CardDescription>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Performance List */}
        <div className="lg:col-span-2 border border-border/50 bg-card rounded-[3rem] p-8 shadow-sm">
          <h2 className="font-display text-2xl font-bold mb-8 flex items-center">
            <TrendingUp className="mr-3 h-6 w-6 text-primary" />
            Produtos Mais Vendidos
          </h2>
          <div className="space-y-4">
            {topItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center space-y-3">
                 <ShoppingBag className="h-10 w-10 text-muted-foreground/20" />
                 <p className="text-muted-foreground italic text-sm">Aguardando as primeiras encomendas...</p>
              </div>
            ) : (
              topItems.map((item: TopItem, index: number) => (
                <div key={index} className="flex items-center justify-between p-5 bg-secondary/10 rounded-[2rem] border border-transparent hover:border-primary/20 hover:bg-secondary/20 transition-all group">
                  <div className="flex items-center gap-5">
                    <span className="flex items-center justify-center w-10 h-10 rounded-2xl bg-background border border-border/50 text-foreground font-bold text-sm shadow-sm group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-colors">
                      {index + 1}
                    </span>
                    <span className="font-bold text-foreground text-lg">{item.name || "Produto s/ nome"}</span>
                  </div>
                  <div className="text-right">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary font-bold text-xs">
                       {item.quantity || 0} vendidos
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* CTA Card */}
        <div className="border border-primary/20 bg-primary/5 rounded-[3rem] p-10 flex flex-col justify-center text-center space-y-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:rotate-12 transition-transform">
             <Star size={120} />
          </div>
          <div className="w-20 h-20 bg-primary/20 rounded-[2rem] flex items-center justify-center mx-auto mb-2 text-primary shadow-inner">
            <Star className="h-10 w-10 fill-primary" />
          </div>
          <div className="space-y-2">
            <h3 className="font-display text-3xl font-bold text-primary leading-tight">Excelência em cada Massa</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Mantenha o catálogo atualizado para encantar seus clientes com novos ingredientes e edições limitadas da estação.
            </p>
          </div>
          <Link href="/admin/produtos">
            <Button className="w-full h-14 rounded-2xl mt-4 font-bold text-base uppercase tracking-widest cursor-pointer shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all bg-primary hover:bg-primary/90 text-primary-foreground">
              Gerenciar Produtos
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
