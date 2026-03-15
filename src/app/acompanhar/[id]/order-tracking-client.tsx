"use client";

import { motion } from "framer-motion";
import { 
  CheckCircle2, 
  Clock, 
  ChefHat, 
  Truck, 
  PackageCheck, 
  XOctagon, 
  ChevronLeft,
  MapPin,
  Building2,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface OrderTrackingClientProps {
  order: any;
}

const steps = [
  { id: "RECEIVED", label: "Recebido", icon: Clock },
  { id: "CONFIRMED", label: "Confirmado", icon: CheckCircle2 },
  { id: "PRODUCTION", label: "Em Produção", icon: ChefHat },
  { id: "SHIPPING", label: "Em Rota", icon: Truck },
  { id: "DELIVERED", label: "Finalizado", icon: PackageCheck },
];

export default function OrderTrackingClient({ order }: OrderTrackingClientProps) {
  const router = useRouter();

  const isCancelled = order.status === "CANCELLED";
  
  // Find current step index
  let currentStepIndex = steps.findIndex(s => s.id === order.status);
  
  // se a entrega for pickup, o texto de shipping deve ser "Disponível para Retirada", mas a logica de passos continua a mesma
  const displaySteps = steps.map(step => {
    if (step.id === "SHIPPING" && order.deliveryType === "PICKUP") {
      return { ...step, label: "Pronto p/ Retirada", icon: Building2 };
    }
    return step;
  });

  if (isCancelled) {
    currentStepIndex = -1; // cancels the progress
  }

  // Se o admin atualizar para um status diferente, talvez a ordem não seja perfeitamente linear, mas o admin sabe os passos. RECEIVED -> CONFIRMED -> PRODUCTION -> SHIPPING -> DELIVERED.

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
            Acompanhar Encomenda
          </h2>
          <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest mt-0.5">
            Pedido #{order.id.slice(-6).toUpperCase()}
          </p>
        </div>
      </header>

      <main className="w-full max-w-2xl px-6 mt-12 space-y-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card/40 border border-border/40 rounded-[2.5rem] p-8 md:p-12 shadow-sm"
        >
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-display font-bold text-primary tracking-tight mb-2">
              Status do Pedido
            </h1>
            <p className="text-sm font-medium text-muted-foreground">
              Acompanhe o andamento da sua encomenda artesanal.
            </p>
          </div>

          {isCancelled ? (
            <div className="flex flex-col items-center justify-center p-8 bg-red-500/[0.05] rounded-[2rem] border border-red-500/10 text-red-700">
               <XOctagon size={48} className="mb-4 opacity-80" />
               <h3 className="text-xl font-bold mb-2">Pedido Cancelado</h3>
               <p className="text-sm text-center font-medium opacity-80">
                 Seu pedido foi cancelado ou não pôde ser completado. Entre em contato para mais informações.
               </p>
            </div>
          ) : (
            <div className="relative">
              {/* Timeline Track Line */}
              <div className="absolute left-[27px] top-6 bottom-6 w-1 bg-muted/30 rounded-full" />
              
              {/* Progress Line */}
              <motion.div 
                className="absolute left-[27px] top-6 w-1 bg-primary rounded-full origin-top"
                initial={{ scaleY: 0 }}
                animate={{ scaleY: currentStepIndex >= 0 ? currentStepIndex / (displaySteps.length - 1) : 0 }}
                transition={{ duration: 1, ease: "easeOut" }}
                style={{
                  height: `calc(100% - 48px)`
                }}
              />

              <div className="space-y-12">
                {displaySteps.map((step, index) => {
                  const isCompleted = index <= currentStepIndex;
                  const isCurrent = index === currentStepIndex;
                  
                  return (
                    <motion.div 
                      key={step.id} 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.15 }}
                      className="relative flex items-center gap-6"
                    >
                      <div 
                        className={`relative z-10 w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-500 shadow-sm
                          ${isCompleted 
                            ? isCurrent 
                              ? 'bg-primary text-white scale-110 shadow-primary/30 ring-4 ring-primary/10' 
                              : 'bg-primary/20 text-primary border-2 border-primary/20' 
                            : 'bg-muted/40 text-muted-foreground/30 border border-border/40'}`}
                      >
                        <step.icon size={24} strokeWidth={isCompleted ? 2.5 : 1.5} />
                      </div>
                      <div className={`space-y-1 transition-all duration-500 ${isCompleted ? 'opacity-100' : 'opacity-40'}`}>
                        <h4 className={`text-lg font-bold tracking-tight ${isCurrent ? 'text-primary' : 'text-foreground'}`}>
                          {step.label}
                        </h4>
                        {isCurrent && (
                          <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                            Fase Atual
                          </p>
                        )}
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </div>
          )}
        </motion.div>

        {/* Resumo Box */}
        <motion.div 
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.6 }}
           className="bg-primary/[0.02] border border-primary/10 rounded-[2.5rem] p-8 md:p-10 space-y-6"
        >
           <h3 className="text-sm font-bold text-muted-foreground/80 uppercase tracking-widest text-center">Resumo da Compra</h3>
           
           <div className="space-y-3">
             {order.items.map((item: any) => (
                <div key={item.id} className="flex justify-between items-center text-sm font-medium">
                  <span className="flex items-center gap-3 text-foreground/80">
                    <span className="h-6 w-6 bg-primary/10 text-primary rounded-md flex items-center justify-center font-bold text-xs">{item.quantity}x</span>
                    {item.productName}
                  </span>
                </div>
             ))}
           </div>

           <div className="pt-6 border-t border-primary/10 flex justify-between items-end">
             <div className="space-y-1">
               <p className="text-[10px] font-bold text-primary/60 uppercase tracking-widest">Total do Pedido</p>
               <p className="text-3xl font-display font-bold text-primary">R$ {parseFloat(order.total).toFixed(2).replace(".", ",")}</p>
             </div>
             
             <div className={`text-[10px] px-3 py-1.5 rounded-full font-bold uppercase tracking-widest border ${order.paymentStatus === 'CONFIRMED' ? 'bg-green-100/50 text-green-700 border-green-200' : 'bg-amber-100/50 text-amber-700 border-amber-200'}`}>
               {order.paymentStatus === 'CONFIRMED' ? 'Pagamento Aprovado' : 'Pagamento Pendente'}
             </div>
           </div>

           {order.paymentStatus === "PENDING" && !isCancelled && (
             <div className="mt-4 p-4 bg-amber-500/10 rounded-2xl border border-amber-500/20 flex items-start gap-3">
               <AlertCircle size={16} className="text-amber-600 shrink-0 mt-0.5" />
               <p className="text-xs font-bold text-amber-900/80 leading-relaxed">
                 Aguardando pagamento do sinal de 50%. Se ainda não pagou, entre em contato via WhatsApp.
               </p>
             </div>
           )}
        </motion.div>
      </main>
    </div>
  );
}
