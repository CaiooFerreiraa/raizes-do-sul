"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Search, ChevronRight, PackageSearch, ChevronLeft, Loader2, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { findOrdersByContact } from "@/actions/order";
import { useSession } from "next-auth/react";

export default function TrackOrderSearchPage() {
  const { data: session, status } = useSession();
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [userOrders, setUserOrders] = useState<any[]>([]);
  const [loadingUserOrders, setLoadingUserOrders] = useState(false);
  const router = useRouter();

  // Load user orders automatically if logged in
  useEffect(() => {
    if (status === "authenticated" && session?.user?.email) {
      loadUserOrders(session.user.email);
    }
  }, [status, session]);

  const loadUserOrders = async (email: string) => {
    setLoadingUserOrders(true);
    try {
      const res = await findOrdersByContact(email);
      if (res.success && res.orders) {
        setUserOrders(res.orders);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingUserOrders(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) {
      toast.error("Digite o e-mail, telefone ou código do pedido.");
      return;
    }

    setLoading(true);
    const res = await findOrdersByContact(query);
    setLoading(false);

    if (res.success && res.orders) {
      if (res.orders.length === 1) {
        router.push(`/acompanhar/${res.orders[0].id}`);
      } else {
        setResults(res.orders);
        toast.success(`Encontramos ${res.orders.length} pedidos.`);
      }
    } else {
      toast.error(res.error || "Pedido não encontrado.");
      setResults([]);
    }
  };

  const [activeTab, setActiveTab] = useState<"active" | "history">("active");

  const filteredOrders = userOrders.filter(order => {
    const isPast = order.status === "DELIVERED" || order.status === "CANCELED";
    return activeTab === "history" ? isPast : !isPast;
  });

  const handleReorder = (order: any) => {
    const items = order.items.map((item: any) => ({
      productId: item.productId,
      quantity: item.quantity
    }));
    const reorderData = btoa(JSON.stringify(items));
    router.push(`/encomenda?reorder=${reorderData}`);
  };

  return (
    <div className="min-h-screen bg-background w-full flex flex-col items-center pb-20">
      <header className="sticky top-0 z-40 bg-background/60 backdrop-blur-xl border-b border-border/10 py-4 px-6 w-full flex items-center">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => router.back()}
          className="h-11 px-4 gap-2 rounded-full border border-border/10 hover:bg-primary/5 hover:text-primary transition-all group cursor-pointer mr-4 shrink-0 text-muted-foreground"
        >
          <ChevronLeft className="h-5 w-5 group-hover:-translate-x-0.5 transition-transform" />
          <span className="text-sm font-bold uppercase tracking-widest">Voltar</span>
        </Button>
        <div className="border-l border-border/10 pl-4 py-1">
          <h2 className="text-xl font-display font-medium text-primary tracking-tight leading-tight">
            Consultar Pedidos
          </h2>
        </div>
      </header>

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-7xl space-y-6 px-6 mt-4 md:mt-6"
      >
        <div className="text-center space-y-1">
          <div className="h-14 w-14 mx-auto bg-primary/10 rounded-full flex items-center justify-center text-primary mb-2 ring-4 ring-primary/5">
            <PackageSearch size={24} />
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-primary tracking-tight">
            Seus Pedidos
          </h1>
          <p className="text-xs md:text-sm font-medium text-muted-foreground max-w-2xl mx-auto">
            Consulte o andamento das suas compras na Raízes do Sul.
          </p>
        </div>

        {/* User Direct Orders Section */}
        {status === "authenticated" && (
          <div className="space-y-4">
            <div className="flex p-0.5 bg-muted/50 rounded-xl border border-border/10 max-w-xs mx-auto">
              <button 
                onClick={() => setActiveTab("active")}
                className={`flex-1 py-2 text-[9px] font-bold uppercase tracking-widest rounded-lg transition-all ${activeTab === 'active' ? 'bg-background text-primary shadow-sm ring-1 ring-border/10' : 'text-muted-foreground hover:text-foreground'}`}
              >
                Ativos
              </button>
              <button 
                onClick={() => setActiveTab("history")}
                className={`flex-1 py-2 text-[9px] font-bold uppercase tracking-widest rounded-lg transition-all ${activeTab === 'history' ? 'bg-background text-primary shadow-sm ring-1 ring-border/10' : 'text-muted-foreground hover:text-foreground'}`}
              >
                Histórico
              </button>
            </div>

            {loadingUserOrders ? (
              <div className="flex justify-center p-8 bg-card/40 rounded-[2rem] border border-border/40">
                <Loader2 className="animate-spin h-6 w-6 text-primary" />
              </div>
            ) : filteredOrders.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredOrders.map((order) => (
                  <motion.div
                    layout
                    key={order.id}
                    className="w-full p-6 rounded-[2rem] bg-card border border-border/40 hover:border-primary/40 transition-all text-left flex flex-col gap-6 group shadow-sm relative overflow-hidden"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                          <Package size={20} />
                        </div>
                        <div>
                          <p className="font-bold text-base text-foreground">
                            Pedido #{order.id.slice(-6).toUpperCase()}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-muted-foreground">
                              {new Date(order.createdAt).toLocaleDateString("pt-BR")}
                            </span>
                            <span className="h-1 w-1 rounded-full bg-border" />
                            <span className={`text-[10px] font-bold uppercase tracking-widest ${
                              order.status === 'DELIVERED' ? 'text-green-600' : 
                              order.status === 'CANCELED' ? 'text-destructive' : 'text-primary'
                            }`}>
                              {order.status === 'PENDING' ? 'Pendente' : 
                               order.status === 'PREPARING' ? 'Preparando' :
                               order.status === 'SHIPPED' ? 'Em Rota' :
                               order.status === 'DELIVERED' ? 'Entregue' :
                               order.status === 'CANCELED' ? 'Cancelado' : order.status}
                            </span>
                          </div>
                        </div>
                      </div>
                      <ChevronRight size={20} className="text-muted-foreground/30 group-hover:text-primary transition-colors cursor-pointer" onClick={() => router.push(`/acompanhar/${order.id}`)} />
                    </div>

                    <div className="flex items-center justify-between border-t border-border/5 pt-6">
                       <p className="text-lg font-display font-medium text-primary">
                         R$ {parseFloat(order.total).toFixed(2).replace('.', ',')}
                       </p>
                       <div className="flex gap-2">
                         <Button
                           variant="ghost"
                           size="sm"
                           onClick={() => router.push(`/acompanhar/${order.id}`)}
                           className="rounded-full text-[9px] font-bold uppercase tracking-widest text-muted-foreground hover:bg-primary/5 hover:text-primary cursor-pointer"
                         >
                           Detalhes
                         </Button>
                         {activeTab === "history" && (
                           <Button
                             size="sm"
                             onClick={() => handleReorder(order)}
                             className="rounded-full text-[9px] font-bold uppercase tracking-widest bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all cursor-pointer border border-primary/20"
                           >
                             Refazer Encomenda
                           </Button>
                         )}
                       </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="p-16 text-center bg-card/40 rounded-[2.5rem] border border-border/40 space-y-3">
                <div className="h-12 w-12 mx-auto bg-muted/20 rounded-full flex items-center justify-center text-muted-foreground/30">
                  <Package size={24} />
                </div>
                <p className="text-sm font-medium text-muted-foreground">
                  {activeTab === "active" ? "Você não possui pedidos em andamento." : "Seu histórico de pedidos está vazio."}
                </p>
              </div>
            )}
          </div>
        )}

        <div className="max-w-2xl mx-auto w-full space-y-10">
          <div className="relative">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t border-border/40"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase tracking-widest font-bold">
              <span className="bg-background px-4 text-muted-foreground/40">Busca Manual</span>
            </div>
          </div>

          <div className="bg-card/40 border border-border/40 rounded-[2.5rem] p-8 md:p-10 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10 -mt-20 -mr-20 pointer-events-none" />

            <form onSubmit={handleSearch} className="space-y-6 relative z-10">
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-muted-foreground/80 font-bold ml-1">
                  E-mail, WhatsApp ou Código
                </label>
                <div className="relative group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50 group-focus-within:text-primary transition-colors" />
                  <Input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Ex: joao@email.com"
                    className="h-14 rounded-2xl bg-background border-border/60 pl-11 pr-5 text-sm font-medium focus:ring-primary/10 hover:border-border transition-all w-full cursor-text"
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                disabled={loading}
                className="w-full h-14 rounded-2xl text-xs font-bold transition-all group cursor-pointer bg-primary text-white shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 hover:scale-[1.02] active:scale-95 border-b-2 border-primary-dark/20 uppercase tracking-widest"
              >
                 {loading ? "Buscando..." : (
                   <span className="flex items-center gap-2">
                     Buscar Pedido
                     <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                   </span>
                 )}
              </Button>
            </form>

            {results.length > 0 && (
               <div className="mt-10 pt-8 border-t border-border/20 space-y-4">
                 <h3 className="text-[11px] font-bold text-muted-foreground/60 uppercase tracking-[0.2em]">Resultados da Busca</h3>
                 <div className="space-y-3">
                   {results.map(order => (
                     <button 
                       key={order.id}
                       onClick={() => router.push(`/acompanhar/${order.id}`)}
                       className="w-full p-4 rounded-2xl bg-background/50 border border-border/40 hover:border-primary/40 hover:bg-primary/5 transition-all text-left group flex justify-between items-center cursor-pointer"
                     >
                       <div>
                         <p className="font-bold text-sm text-foreground/80 group-hover:text-primary transition-colors">
                           {new Date(order.createdAt).toLocaleDateString("pt-BR")} - #{order.id.slice(-4)}
                         </p>
                         <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-1">
                           Status: {order.status}
                         </p>
                       </div>
                       <ChevronRight size={16} className="text-muted-foreground/30 group-hover:text-primary transition-colors" />
                     </button>
                   ))}
                 </div>
               </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
