import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { prisma } from "@/infrastructure/database/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { TrendingUp, Package, ShoppingBag, BarChart3, Star } from "lucide-react";


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

  // Best selling products - Defensive approach to avoid "Unknown field" errors
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
      // Use related product name or a generic "Produto" if relation/field is missing
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

  // Daily summary logic with fallback for potential Prisma Client sync issues
  let [ordersToday, ordersTomorrow, pendingOrders, completedOrders, pendingPayment] = [0, 0, 0, 0, 0];
  
  try {
    const counts = await Promise.all([
      prisma.order.count({ where: { scheduledDate: { gte: todayDate, lt: tomorrowDate } } as any }),
      prisma.order.count({ where: { scheduledDate: { gte: tomorrowDate, lt: dayAfterTomorrow } } as any }),
      prisma.order.count({ where: { status: { in: ["RECEIVED", "CONFIRMED", "PRODUCTION", "PENDING"] } } }),
      prisma.order.count({ where: { status: { in: ["DELIVERED", "COMPLETED"] } } }),
      prisma.order.count({ where: { paymentStatus: "PENDING" } }),
    ]);
    [ordersToday, ordersTomorrow, pendingOrders, completedOrders, pendingPayment] = counts;
  } catch (error) {
    console.error("Erro ao carregar resumo operacional:", error);
    // Fallback to basic counts without date filtering if scheduledDate is unknown
    try {
      pendingOrders = await prisma.order.count({ where: { status: { in: ["RECEIVED", "CONFIRMED", "PRODUCTION", "PENDING"] } } });
      completedOrders = await prisma.order.count({ where: { status: { in: ["DELIVERED", "COMPLETED"] } } });
      pendingPayment = await prisma.order.count({ where: { paymentStatus: "PENDING" } });
    } catch (e) {
      console.error("Erro no fallback de contagem:", e);
    }
  }

  return (
    <div className="space-y-12 max-w-6xl mx-auto">
      {/* Resumo Operacional */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {[
          { label: "Hoje", count: ordersToday, color: "bg-primary" },
          { label: "Amanhã", count: ordersTomorrow, color: "bg-blue-500" },
          { label: "Ped. Pendentes", count: pendingOrders, color: "bg-amber-500" },
          { label: "Pag. Pendentes", count: pendingPayment, color: "bg-red-500" },
          { label: "Concluídos", count: completedOrders, color: "bg-green-500" }
        ].map((item) => (
          <div key={item.label} className="bg-card border border-border/40 rounded-3xl p-6 flex items-center justify-between shadow-sm">
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{item.label}</p>
              <p className="text-2xl font-bold mt-1">{item.count}</p>
            </div>
            <div className={`h-10 w-10 rounded-2xl ${item.color} flex items-center justify-center text-white font-bold opacity-20`}>
              {item.label[0]}
            </div>
          </div>
        ))}
      </div>
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="font-display text-4xl sm:text-6xl font-bold text-foreground tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-3 text-lg md:text-xl">Acompanhe o crescimento das Raízes do Sul.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/">
            <Button variant="outline" className="rounded-xl h-12 cursor-pointer border-border/50 bg-background/50 backdrop-blur-sm">
              <Star className="mr-2 h-4 w-4 text-primary" />
              Ir para Loja
            </Button>
          </Link>
          <Link href="/admin/pedidos">
            <Button variant="outline" className="rounded-xl h-12 cursor-pointer border-border/50">
              <ShoppingBag className="mr-2 h-4 w-4" />
              Ver Pedidos
            </Button>
          </Link>
          <Link href="/admin/produtos">
            <Button className="rounded-xl h-12 cursor-pointer shadow-lg shadow-primary/20">
              <Package className="mr-2 h-4 w-4" />
              Catálogo
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="rounded-[2rem] border-border/50 bg-gradient-to-br from-background to-secondary/20 shadow-sm border-b-4 border-b-primary/30">
          <CardHeader className="pb-2">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-2">
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
            <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Vendas no Mês</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-foreground">R$ {monthlyRevenue.toFixed(2).replace(".", ",")}</p>
            <CardDescription className="text-xs mt-1">Total acumulado em {now.toLocaleDateString('pt-BR', { month: 'long' })}</CardDescription>
          </CardContent>
        </Card>

        <Card className="rounded-[2rem] border-border/50 bg-gradient-to-br from-background to-secondary/20 shadow-sm border-b-4 border-b-blue-500/30">
          <CardHeader className="pb-2">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center mb-2">
              <BarChart3 className="h-5 w-5 text-blue-500" />
            </div>
            <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Ticket Médio</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-foreground">R$ {Number(averageOrderValue).toFixed(2).replace(".", ",")}</p>
            <CardDescription className="text-xs mt-1">Média de valor por encomenda</CardDescription>
          </CardContent>
        </Card>

        <Card className="rounded-[2rem] border-border/50 bg-gradient-to-br from-background to-secondary/20 shadow-sm border-b-4 border-b-orange-500/30">
          <CardHeader className="pb-2">
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center mb-2">
              <ShoppingBag className="h-5 w-5 text-orange-500" />
            </div>
            <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Total Pedidos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-foreground">{ordersCount}</p>
            <CardDescription className="text-xs mt-1">Encomendas recebidas</CardDescription>
          </CardContent>
        </Card>

        <Card className="rounded-[2rem] border-border/50 bg-gradient-to-br from-background to-secondary/20 shadow-sm border-b-4 border-b-purple-500/30">
          <CardHeader className="pb-2">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center mb-2">
              <Star className="h-5 w-5 text-purple-500" />
            </div>
            <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Produtos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-foreground">{productsCount}</p>
            <CardDescription className="text-xs mt-1">Itens ativos no catálogo</CardDescription>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 border border-border/50 bg-card rounded-[2.5rem] p-8 shadow-sm">
          <h2 className="font-display text-2xl font-bold mb-6 flex items-center">
            <TrendingUp className="mr-2 h-6 w-6 text-primary" />
            Produtos Mais Vendidos
          </h2>
          <div className="space-y-4">
            {topItems.length === 0 ? (
              <p className="text-muted-foreground italic">Aguardando as primeiras encomendas...</p>
            ) : (
              topItems.map((item: TopItem, index: number) => (
                <div key={index} className="flex items-center justify-between p-4 bg-secondary/10 rounded-2xl border border-transparent hover:border-primary/20 transition-all">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm">
                      {index + 1}
                    </span>
                    <span className="font-medium text-foreground">{item.name || "Produto s/ nome"}</span>
                  </div>
                  <span className="text-muted-foreground font-bold">{item.quantity || 0} vendidos</span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="border border-border/50 bg-primary/5 rounded-[2.5rem] p-8 flex flex-col justify-center text-center space-y-4">
          <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-2">
            <ShoppingBag className="h-8 w-8 text-primary" />
          </div>
          <h3 className="font-display text-2xl font-bold text-primary">Pronto para crescer?</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Mantenha seu catálogo atualizado para atrair mais clientes e acompanhe as tendências de sabor aqui!
          </p>
          <Link href="/admin/produtos">
            <Button className="w-full h-12 rounded-full mt-4 font-bold cursor-pointer">
              Novo Produto
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
