import { prisma } from "@/infrastructure/database/prisma";
import { BackButton } from "@/components/ui/back-button";
import { AdminOrdersClient } from "./admin-orders-client";

export default async function AdminOrders() {
  const orders = await prisma.order.findMany({
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-7xl mx-auto space-y-8 md:space-y-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-4 border-b border-border/10">
        <div className="flex items-center gap-6">
          <BackButton />
          <div>
            <h1 className="font-display text-3xl sm:text-5xl font-bold text-foreground tracking-tight">Encomendas</h1>
            <p className="text-muted-foreground mt-2 text-sm md:text-md uppercase tracking-[0.15em] font-medium opacity-70">
              Gerencie a produção e logística do Raízes do Sul.
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-4 bg-primary/5 px-6 py-4 rounded-3xl border border-primary/10 self-start md:self-center transition-all hover:bg-primary/10">
          <div className="text-right">
            <p className="text-[10px] font-bold text-primary/60 uppercase tracking-widest">Fluxo Mensal</p>
            <p className="text-xl font-bold text-primary">{orders.length} Encomendas</p>
          </div>
        </div>
      </div>

      <AdminOrdersClient initialOrders={orders as any} />
    </div>
  );
}
