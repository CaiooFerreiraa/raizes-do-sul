"use client";

import { useState } from "react";
import { 
  Truck, 
  MapPin, 
  CreditCard, 
  User, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  ExternalLink, 
  MessageSquare,
  ShoppingBag,
  Search,
  Filter,
  ChevronDown,
  Trash2,
  AlertTriangle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { updateOrderStatus, updatePaymentStatus, toggleDepositPaid, deleteOrderAction } from "@/actions/admin-orders";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface OrderItem {
  id: string;
  productId: string | null;
  productName: string | null;
  quantity: number;
  price: any;
  product: { id: string; name: string } | null;
}

interface OrderWithItems {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string | null;
  notes: string | null;
  status: string;
  deliveryType: string | null;
  pickupPoint: string | null;
  street: string | null;
  number: string | null;
  neighborhood: string | null;
  reference: string | null;
  paymentMethod: string | null;
  paymentStatus: string | null;
  depositPaid: boolean;
  scheduledDate: Date | null;
  scheduledTime: string | null;
  total: any;
  createdAt: Date;
  items: OrderItem[];
}

export function AdminOrdersClient({ initialOrders }: { initialOrders: OrderWithItems[] }) {
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [filterDate, setFilterDate] = useState<string>("ALL");
  const [search, setSearch] = useState("");

  const filteredOrders = initialOrders.filter(order => {
    // Filter by status
    if (filterStatus !== "ALL" && order.status !== filterStatus) return false;
    
    // Filter by search
    if (search && !order.customerName.toLowerCase().includes(search.toLowerCase()) && !order.customerEmail.toLowerCase().includes(search.toLowerCase())) return false;

    // Filter by date
    if (filterDate !== "ALL") {
      const today = new Date();
      today.setHours(0,0,0,0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const nextWeek = new Date(today);
      nextWeek.setDate(nextWeek.getDate() + 7);

      const scheduled = order.scheduledDate ? new Date(order.scheduledDate) : null;
      if (!scheduled) return filterDate === "NONE";
      scheduled.setHours(0,0,0,0);

      if (filterDate === "TODAY" && scheduled.getTime() !== today.getTime()) return false;
      if (filterDate === "TOMORROW" && scheduled.getTime() !== tomorrow.getTime()) return false;
      if (filterDate === "WEEK" && (scheduled < today || scheduled > nextWeek)) return false;
    }

    return true;
  });

  const getStatusInfo = (status: string) => {
    switch (status) {
      case "RECEIVED": return { label: "Recebido", color: "bg-blue-100 text-blue-800 border-blue-200" };
      case "CONFIRMED": return { label: "Confirmado", color: "bg-cyan-100 text-cyan-800 border-cyan-200" };
      case "PRODUCTION": return { label: "Em Produção", color: "bg-orange-100 text-orange-800 border-orange-200" };
      case "SHIPPING": return { label: "Saiu para Entrega", color: "bg-purple-100 text-purple-800 border-purple-200" };
      case "DELIVERED": return { label: "Entregue", color: "bg-green-100 text-green-800 border-green-200" };
      case "CANCELLED": return { label: "Cancelado", color: "bg-red-100 text-red-800 border-red-200" };
      case "PENDING": return { label: "Pendente", color: "bg-yellow-100 text-yellow-800 border-yellow-200" };
      default: return { label: status, color: "bg-gray-100 text-gray-800 border-gray-200" };
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    const res = await updateOrderStatus(id, status);
    if (res.success) toast.success("Status atualizado!");
    else toast.error("Erro ao atualizar.");
  };

  return (
    <div className="space-y-8">
      {/* Filtros */}
      <div className="bg-card border border-border/50 rounded-[2rem] p-6 shadow-sm">
        <div className="flex flex-col md:flex-row gap-6 items-end">
          <div className="flex-1 space-y-2 w-full">
            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 ml-1">Pesquisar Cliente</label>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/40" size={16} />
              <input 
                type="text" 
                placeholder="Nome ou e-mail..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-11 bg-muted/20 border-border/40 rounded-xl pl-12 pr-4 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/5 transition-all"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 w-full md:w-auto">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 ml-1">Status</label>
              <select 
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full h-11 bg-muted/20 border-border/40 rounded-xl px-4 text-[10px] font-bold uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-primary/5 transition-all appearance-none cursor-pointer"
              >
                <option value="ALL">Todos os Status</option>
                <option value="RECEIVED">Recebido</option>
                <option value="CONFIRMED">Confirmado</option>
                <option value="PRODUCTION">Em Produção</option>
                <option value="SHIPPING">Em Entrega</option>
                <option value="DELIVERED">Entregue</option>
                <option value="CANCELLED">Cancelado</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 ml-1">Data</label>
              <select 
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="w-full h-11 bg-muted/20 border-border/40 rounded-xl px-4 text-[10px] font-bold uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-primary/5 transition-all appearance-none cursor-pointer"
              >
                <option value="ALL">Qualquer Data</option>
                <option value="TODAY">Hoje</option>
                <option value="TOMORROW">Amanhã</option>
                <option value="WEEK">Esta Semana</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-8">
        {filteredOrders.length === 0 ? (
          <div className="border border-border/50 bg-card rounded-[2.5rem] p-16 text-center">
            <Filter size={40} className="mx-auto text-muted-foreground/10 mb-4" />
            <p className="text-muted-foreground italic text-lg opacity-40">Nenhum pedido encontrado nos filtros selecionados.</p>
          </div>
        ) : (
          filteredOrders.map((order) => (
            <OrderCard key={order.id} order={order} getStatusInfo={getStatusInfo} onStatusChange={handleStatusChange} />
          ))
        )}
      </div>
    </div>
  );
}

function OrderCard({ order, getStatusInfo, onStatusChange }: { order: OrderWithItems, getStatusInfo: any, onStatusChange: any }) {
  const statusInfo = getStatusInfo(order.status || "RECEIVED");
  const [confirmDelete, setConfirmDelete] = useState<boolean>(false);
  const [deleting, setDeleting] = useState<boolean>(false);
  
  const openMaps = () => {
    if (!order.street) return;
    const addr = `${order.street}, ${order.number}, ${order.neighborhood}, Pelotas, RS`;
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addr)}`, '_blank');
  };

  const openWhatsApp = () => {
    if (!order.customerPhone) return;
    const phone = order.customerPhone.replace(/\D/g, "");
    const msg = encodeURIComponent(`Olá ${order.customerName}! Recebemos seu pedido na Raízes do Sul.`);
    window.open(`https://wa.me/55${phone}?text=${msg}`, '_blank');
  };

  const handleToggleDeposit = async () => {
    const res = await toggleDepositPaid(order.id, !order.depositPaid);
    if (res.success) toast.success("Sinal atualizado!");
  };

  const handlePaymentStatus = async (s: string) => {
    const res = await updatePaymentStatus(order.id, s);
    if (res.success) toast.success("Pagamento atualizado!");
  };

  const handleDelete = async () => {
    setDeleting(true);
    const res = await deleteOrderAction(order.id);
    setDeleting(false);
    if (res.success) {
      toast.success("Encomenda excluída.");
      setConfirmDelete(false);
    } else {
      toast.error(res.error ?? "Erro ao excluir.");
    }
  };

  return (
    <div className="border border-border/50 bg-card rounded-[2.5rem] p-8 md:p-10 shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden relative">
      {/* Background Accent */}
      <div className={`absolute top-0 right-0 w-64 h-64 opacity-[0.03] -mr-16 -mt-16 rounded-full blur-3xl pointer-events-none ${order.deliveryType === 'DELIVERY' ? 'bg-primary' : 'bg-amber-500'}`} />

      <div className="flex flex-col lg:flex-row justify-between gap-10">
        <div className="flex-1 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="h-14 w-14 rounded-full bg-muted/40 flex items-center justify-center shrink-0 border border-border/20">
              <User size={24} className="text-muted-foreground/20" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="font-display text-3xl font-bold tracking-tight">{order.customerName}</h2>
                <DropdownMenu>
                  <DropdownMenuTrigger 
                    render={
                      <button className={`px-4 py-1.5 rounded-full text-[10px] font-bold border uppercase tracking-widest cursor-pointer hover:opacity-80 transition-all flex items-center gap-2 ${statusInfo.color}`} />
                    }
                  >
                    {statusInfo.label}
                    <ChevronDown size={10} />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="rounded-2xl p-1 shadow-2xl bg-card border-border/20">
                    {["RECEIVED", "CONFIRMED", "PRODUCTION", "SHIPPING", "DELIVERED", "CANCELLED"].map(s => (
                      <DropdownMenuItem key={s} onClick={() => onStatusChange(order.id, s)} className="rounded-xl text-[10px] font-bold uppercase tracking-wider py-2 cursor-pointer focus:bg-primary/5 focus:text-primary">
                        {getStatusInfo(s).label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <p className="text-muted-foreground/60 text-sm mt-1 flex items-center gap-4">
                <span className="flex items-center gap-2">
                   {order.customerEmail}
                </span>
                <span className="w-1 h-1 rounded-full bg-border" />
                <span className="flex items-center gap-1.5 font-bold text-foreground/70">
                   {order.customerPhone}
                </span>
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 rounded-3xl bg-muted/10 border border-border/10 space-y-1">
              <p className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest flex items-center gap-2">
                <Truck size={12} /> Modalidade
              </p>
              <p className="text-sm font-bold flex flex-col">
                {order.deliveryType === 'PICKUP' ? `Retirada: ${order.pickupPoint === 'FEIRA' ? 'Na Feira' : 'Na Loja'}` : 'Delivery (Entrega)' }
              </p>
            </div>
            <div className="p-4 rounded-3xl bg-muted/10 border border-border/10 space-y-1">
              <p className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest flex items-center gap-2">
                <CreditCard size={12} /> Pagamento
              </p>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold">
                  {order.paymentMethod === "PIX" ? "Pix" : order.paymentMethod === "CASH" ? "Dinheiro" : order.paymentMethod === "DEBIT" ? "Débito" : "Crédito"}
                </span>
                <DropdownMenu>
                  <DropdownMenuTrigger 
                    render={
                      <button className={`text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border cursor-pointer hover:opacity-80 transition-all ${order.paymentStatus === 'CONFIRMED' || order.paymentStatus === 'PAID' ? 'bg-green-100/50 text-green-700 border-green-200' : 'bg-red-100/50 text-red-700 border-red-200'}`} />
                    }
                  >
                    {order.paymentStatus === 'CONFIRMED' || order.paymentStatus === 'PAID' ? 'Pago' : 'Pendente'}
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="rounded-xl p-1 shadow-2xl bg-card border-border/20">
                    <DropdownMenuItem onClick={() => handlePaymentStatus('PAID')} className="rounded-lg text-[10px] font-bold uppercase tracking-wider py-2 cursor-pointer">Pago</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handlePaymentStatus('PENDING')} className="rounded-lg text-[10px] font-bold uppercase tracking-wider py-2 cursor-pointer">Pendente</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            <div className={`p-4 rounded-3xl border space-y-1 transition-all cursor-pointer ${order.depositPaid ? 'bg-green-500/[0.03] border-green-500/10' : 'bg-amber-500/[0.03] border-amber-500/10'}`} onClick={handleToggleDeposit}>
              <p className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest flex items-center gap-2">
                <CheckCircle2 size={12} className={order.depositPaid ? 'text-green-500/60' : 'text-amber-500/60'} /> Sinal de 50%
              </p>
              <p className={`text-sm font-bold ${order.depositPaid ? 'text-green-700' : 'text-amber-700'}`}>
                {order.depositPaid ? 'Confirmado' : 'Aguardando'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div className="p-5 rounded-3xl bg-primary/[0.02] border border-primary/10 space-y-2">
                <p className="text-[10px] font-bold text-primary/40 uppercase tracking-widest flex items-center gap-2">
                  <Calendar size={12} /> Agendamento
                </p>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 text-sm font-bold">
                    <Calendar size={14} className="opacity-40" />
                    {order.scheduledDate ? new Date(order.scheduledDate).toLocaleDateString("pt-BR") : "Data não definida"}
                  </div>
                  {order.scheduledTime && (
                    <div className="flex items-center gap-2 text-sm font-bold">
                      <Clock size={14} className="opacity-40" />
                      {order.scheduledTime}
                    </div>
                  )}
                </div>
             </div>
             {order.deliveryType === 'DELIVERY' && order.street && (
               <div className="p-5 rounded-3xl bg-secondary/[0.02] border border-secondary/10 space-y-2 group cursor-pointer" onClick={openMaps}>
                 <div className="flex justify-between items-start">
                   <p className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest flex items-center gap-2">
                    <MapPin size={12} /> Endereço
                   </p>
                   <ExternalLink size={12} className="text-muted-foreground/20 group-hover:text-primary transition-colors" />
                 </div>
                 <p className="text-xs font-medium leading-relaxed">
                   {order.street}, {order.number}<br/>
                   <span className="opacity-70 text-[10px] uppercase font-bold tracking-wider">{order.neighborhood}</span>
                 </p>
               </div>
             )}
          </div>
        </div>

        <div className="lg:w-80 flex flex-col gap-8">
          <div className="flex-1 overflow-hidden">
            <h3 className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
               <ShoppingBag size={12} /> Resumo
            </h3>
            <div className="space-y-3">
              {order.items.map(item => (
                 <div key={item.id} className="flex justify-between items-center text-xs">
                    <div className="flex items-center gap-3">
                       <span className="h-6 w-6 rounded-lg bg-muted/60 flex items-center justify-center font-bold text-[10px]">{item.quantity}x</span>
                       <span className="font-medium opacity-80">{item.productName || item.product?.name}</span>
                    </div>
                    <span className="font-bold">R$ {parseFloat(item.price).toFixed(2).replace(".", ",")}</span>
                 </div>
              ))}
              <div className="pt-4 border-t border-border/10 flex justify-between items-center">
                 <span className="text-[10px] font-bold uppercase tracking-wider opacity-40">Total do Pedido</span>
                 <span className="text-2xl font-bold text-primary">R$ {parseFloat(order.total).toFixed(2).replace(".", ",")}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3">
            <Button onClick={openWhatsApp} className="w-full h-12 rounded-2xl bg-green-500 hover:bg-green-600 text-white font-bold text-xs uppercase tracking-widest shadow-lg shadow-green-500/20 cursor-pointer flex items-center gap-3 transition-all hover:scale-[1.02]">
              <MessageSquare size={16} /> Entrar em Contato
            </Button>

            {/* Botão Excluir */}
            {!confirmDelete ? (
              <button
                onClick={() => setConfirmDelete(true)}
                className="w-full h-11 rounded-2xl border border-destructive/25 text-destructive/60 hover:text-destructive hover:border-destructive/50 hover:bg-destructive/5 transition-all text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 cursor-pointer"
              >
                <Trash2 size={13} />
                Excluir Encomenda
              </button>
            ) : (
              <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-4 space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-200">
                <div className="flex items-center gap-2 text-destructive">
                  <AlertTriangle size={14} />
                  <p className="text-[10px] font-bold uppercase tracking-wide">Confirmar exclusão?</p>
                </div>
                <p className="text-[10px] text-muted-foreground leading-relaxed">
                  Essa ação é permanente e não pode ser desfeita.
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setConfirmDelete(false)}
                    disabled={deleting}
                    className="h-9 rounded-xl border border-border/60 text-[10px] font-bold uppercase tracking-wide text-muted-foreground hover:bg-muted/30 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="h-9 rounded-xl bg-destructive text-destructive-foreground text-[10px] font-bold uppercase tracking-wide hover:bg-destructive/90 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
                  >
                    {deleting ? (
                      <span className="animate-pulse">Excluindo...</span>
                    ) : (
                      <><Trash2 size={11} /> Excluir</>  
                    )}
                  </button>
                </div>
              </div>
            )}

            <p className="text-[9px] text-center text-muted-foreground/40 font-bold uppercase tracking-widest">
              Criado em: {new Date(order.createdAt).toLocaleDateString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
            </p>
          </div>
        </div>
      </div>

      {order.notes && (
        <div className="mt-8 p-6 bg-amber-500/[0.02] border border-amber-500/10 rounded-3xl">
           <p className="text-[9px] font-bold text-amber-900/40 uppercase tracking-[0.2em] mb-2">Instruções do Cliente</p>
           <p className="text-sm italic text-amber-900/80 leading-relaxed font-medium">"{order.notes}"</p>
        </div>
      )}
    </div>
  );
}
