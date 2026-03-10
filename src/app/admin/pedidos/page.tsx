import { prisma } from "@/infrastructure/database/prisma";
import { BackButton } from "@/components/ui/back-button";
import type { Prisma } from "@prisma/client";

interface OrderItem {
  id: string;
  productId: string | null;
  productName: string | null;
  quantity: number;
  price: Prisma.Decimal;
  product: { id: string; name: string } | null;
}

interface OrderWithItems {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string | null;
  notes: string | null;
  status: string;
  total: Prisma.Decimal;
  createdAt: Date;
  items: OrderItem[];
}


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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "COMPLETED": return "bg-green-100 text-green-800 border-green-200";
      case "CANCELLED": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 md:space-y-12">
      <div className="flex items-center gap-6">
        <BackButton />
        <div className="border-l border-border/50 pl-6 py-2">
          <h1 className="font-display text-3xl sm:text-5xl font-bold text-foreground">Encomendas Recebidas</h1>
          <p className="text-muted-foreground mt-1 text-md md:text-lg">Gerencie os pedidos e o contato com os clientes.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {orders.length === 0 ? (
          <div className="border border-border/50 bg-card rounded-[2.5rem] p-12 text-center">
            <p className="text-muted-foreground italic text-lg opacity-60">Nenhuma encomenda recebida ainda.</p>
          </div>
        ) : (
          orders.map((order: OrderWithItems) => (
            <div key={order.id} className="border border-border/50 bg-card rounded-[2.5rem] p-6 md:p-8 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="font-display text-2xl font-bold text-foreground">{order.customerName}</h2>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </div>
                  <p className="text-muted-foreground text-sm">
                    {order.customerEmail} • {order.customerPhone || "Sem telefone"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(order.createdAt).toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit"
                    })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold">Total</p>
                  <p className="text-3xl font-bold text-primary">R$ {order.total.toString()}</p>
                </div>
              </div>

              <div className="border-t border-border/50 pt-6">
                <h3 className="text-sm font-bold text-foreground mb-4 uppercase tracking-widest">Itens do Pedido</h3>
                <div className="space-y-3">
                  {order.items.map((item: OrderItem) => (
                    <div key={item.id} className="flex justify-between items-center bg-secondary/10 p-4 rounded-2xl">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/20 text-primary font-bold text-sm">
                          {item.quantity}x
                        </span>
                        <span className="font-medium text-foreground">{item.productName || item.product?.name}</span>
                      </div>
                      <span className="text-muted-foreground font-medium">R$ {item.price.toString()}</span>
                    </div>
                  ))}
                </div>
              </div>

              {order.notes && (
                <div className="mt-6 p-4 bg-yellow-50/50 border border-yellow-200/50 rounded-2xl">
                  <p className="text-xs font-bold text-yellow-800 mb-1 uppercase tracking-widest">Observações</p>
                  <p className="text-sm text-yellow-900 leading-relaxed italic">"{order.notes}"</p>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
