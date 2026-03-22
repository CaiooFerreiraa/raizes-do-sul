"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { createOrder } from "@/actions/order";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from "@/components/ui/sheet";

import {
  Search,
  Truck,
  CreditCard,
  Wallet,
  QrCode,
  Building2,
  MapPin,
  AlertCircle,
  ChevronRight,
  ChevronLeft,
  ShoppingBag,
  CheckCircle2,
  Package,
  Trash2,
  ShoppingBasket,
  Minus,
  Plus,
  ArrowRight,
  ArrowLeft
} from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type FlavorDTO = {
  id: string;
  name: string;
  price: string;
  imageUrl: string | null;
  isAvailable: boolean;
};

type ProductDTO = {
  id: string;
  name: string;
  description: string | null;
  price: string;
  imageUrl: string | null;
  images: string[];
  flavors: FlavorDTO[];
};

// Chave única para item no carrinho: productId ou productId_flavorId
type CartItemKey = string;

type Step = "selection" | "checkout" | "success";

function getCartKey(productId: string, flavorId?: string): CartItemKey {
  return flavorId ? `${productId}_${flavorId}` : productId;
}

function parseCartKey(key: CartItemKey): { productId: string; flavorId?: string } {
  const parts = key.split("_");
  if (parts.length === 2) {
    return { productId: parts[0], flavorId: parts[1] };
  }
  return { productId: parts[0] };
}

function OrderFormContent({ initialProducts }: { initialProducts: ProductDTO[] }) {
  const [step, setStep] = useState<Step>("selection");
  const [createdOrderId, setCreatedOrderId] = useState<string | null>(null);
  const [isOnlinePayment, setIsOnlinePayment] = useState(false);
  const [quantities, setQuantities] = useState<{ [key: string]: number }>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('cart_quantities');
      return saved ? JSON.parse(saved) : {};
    }
    return {};
  });

  // Persistir no localStorage
  useEffect(() => {
    localStorage.setItem('cart_quantities', JSON.stringify(quantities));
  }, [quantities]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [deliveryType, setDeliveryType] = useState("PICKUP");
  const [pickupPoint, setPickupPoint] = useState("LOJA");
  const [paymentMethod, setPaymentMethod] = useState("PIX");
  const [orderDetails, setOrderDetails] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    notes: "",
    street: "",
    number: "",
    neighborhood: "",
    reference: "",
    scheduledDate: new Date().toISOString().split('T')[0],
    scheduledTime: ""
  });
  const [whatsappUrl, setWhatsappUrl] = useState<string>("");


  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const user = session?.user;
    if (user) {
      setOrderDetails(prev => ({
        ...prev,
        customerName: user.name || "",
        customerEmail: user.email || "",
        customerPhone: user.phone || "",
        street: user.street || "",
        number: user.number || "",
        neighborhood: user.neighborhood || "",
        reference: user.reference || "",
      }));
    }
  }, [session]);

  // Se mudar para DELIVERY e o pagamento for DINHEIRO, volta para PIX
  useEffect(() => {
    if (deliveryType === "DELIVERY" && paymentMethod === "CASH") {
      setPaymentMethod("PIX");
    }
  }, [deliveryType, paymentMethod]);

  useEffect(() => {
    const productId = searchParams.get("productId");
    const flavorId = searchParams.get("flavorId");
    const reorderData = searchParams.get("reorder");

    if (productId && initialProducts.some((p: ProductDTO) => p.id === productId)) {
      const cartKey = getCartKey(productId, flavorId || undefined);
      setQuantities(prev => {
        if (prev[cartKey]) return prev;
        return { ...prev, [cartKey]: 1 };
      });
    }

    if (reorderData) {
      try {
        const decoded = JSON.parse(atob(reorderData));
        if (Array.isArray(decoded)) {
          const newQuantities: { [key: string]: number } = {};
          decoded.forEach((item: any) => {
            if (item.productId && initialProducts.some(p => p.id === item.productId)) {
              const cartKey = getCartKey(item.productId, item.flavorId);
              newQuantities[cartKey] = item.quantity;
            }
          });
          setQuantities(prev => ({ ...prev, ...newQuantities }));
          toast.success("Itens carregados para reencomenda!");
        }
      } catch (e) {
        console.error("Erro ao processar reencomenda:", e);
      }
    }
  }, [searchParams, initialProducts]);

  const filteredProducts = initialProducts.filter((p: ProductDTO) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleQuantity = (cartKey: string, delta: number) => {
    setQuantities((prev: { [key: string]: number }) => {
      const next = (prev[cartKey] || 0) + delta;
      return { ...prev, [cartKey]: Math.max(0, next) };
    });
  };

  const getSubtotal = () => {
    let total = 0;
    Object.entries(quantities).forEach(([cartKey, qty]) => {
      if (qty <= 0) return;
      const { productId, flavorId } = parseCartKey(cartKey);
      const product = initialProducts.find(p => p.id === productId);
      if (!product) return;

      if (flavorId) {
        const flavor = product.flavors.find(f => f.id === flavorId);
        if (flavor) {
          total += parseFloat(flavor.price) * qty;
        }
      } else {
        total += parseFloat(product.price) * qty;
      }
    });
    return total;
  };

  // Itens selecionados com info completa
  const getSelectedItems = () => {
    const items: Array<{
      cartKey: string;
      product: ProductDTO;
      flavor: FlavorDTO | null;
      quantity: number;
      price: string;
      displayName: string;
    }> = [];

    Object.entries(quantities).forEach(([cartKey, qty]) => {
      if (qty <= 0) return;
      const { productId, flavorId } = parseCartKey(cartKey);
      const product = initialProducts.find(p => p.id === productId);
      if (!product) return;

      const flavor = flavorId ? product.flavors.find(f => f.id === flavorId) || null : null;
      const price = flavor ? flavor.price : product.price;
      const displayName = flavor ? `${product.name} - ${flavor.name}` : product.name;

      items.push({ cartKey, product, flavor, quantity: qty, price, displayName });
    });

    return items;
  };

  const selectedItems = getSelectedItems();
  const totalItems = Object.values(quantities).reduce((a, b) => a + b, 0);

  const handleNextStep = () => {
    if (totalItems === 0) {
      toast.error("Selecione itens para continuar.");
      return;
    }
    setStep("checkout");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePrevStep = () => {
    if (step === "checkout") {
      setStep("selection");
    } else {
      router.back();
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setOrderDetails(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderDetails.customerName || !orderDetails.customerEmail) {
      toast.error("Preencha seu nome e e-mail.");
      return;
    }

    const items = selectedItems.map((item) => ({
      productId: item.product.id,
      flavorId: item.flavor?.id,
      flavorName: item.flavor?.name,
      name: item.displayName,
      quantity: item.quantity,
      price: parseFloat(item.price),
      imageUrl: item.flavor?.imageUrl || item.product.imageUrl || (item.product.images && item.product.images.length > 0 ? item.product.images[0] : undefined),
    }));

    setLoading(true);
    const res = await createOrder({
      ...orderDetails,
      deliveryType,
      pickupPoint: deliveryType === "PICKUP" ? pickupPoint : undefined,
      paymentMethod,
      items,
    });
    setLoading(false);

    if (res.success) {
      const orderId = res.orderId as string;
      const paymentUrl = (res as any).paymentUrl as string | undefined;
      setCreatedOrderId(orderId);
      setIsOnlinePayment(!!paymentUrl);

      // WhatsApp Resume
      const friendlyPayment = {
        'PIX': 'Pix',
        'DEBIT': 'Cartão de Débito',
        'CREDIT': 'Cartão de Crédito',
        'CASH': 'Dinheiro'
      }[paymentMethod] || paymentMethod;

      const friendlyDelivery = deliveryType === 'PICKUP'
        ? `Vou retirar na ${pickupPoint === 'LOJA' ? 'loja' : 'feira'}`
        : `Entrega em: ${orderDetails.street}, ${orderDetails.number} (${orderDetails.neighborhood})`;

      const subtotal = getSubtotal();
      const signalValue = subtotal / 2;

      // Se for Cartão de Crédito via AbacatePay, a mensagem muda um pouco no WhatsApp
      const isOnlinePayment = !!paymentUrl;

      const message = [
        "Olá, tudo bem?",
        "",
        "Fiz uma nova encomenda pelo site da *Raízes do Sul* e estou enviando o resumo aqui!",
        "",
        `*MEU PEDIDO (#${orderId.slice(-6).toUpperCase()})*`,
        "",
        "*O que eu escolhi:*",
        ...selectedItems.map(item => {
          const flavorMsg = item.flavor ? ` (${item.flavor.name})` : "";
          return `- ${item.quantity}x ${item.product.name}${flavorMsg} — R$ ${(parseFloat(item.price) * item.quantity).toFixed(2).replace('.', ',')}`;
        }),
        "",
        `*Total:* R$ ${subtotal.toFixed(2).replace('.', ',')}`,
        "",
        !paymentUrl ? `*Sinal (50%):* R$ ${signalValue.toFixed(2).replace('.', ',')}` : null,
        !paymentUrl ? "" : null,
        `*Pagamento:* ${friendlyPayment}${paymentUrl ? ' (Pago Online)' : ''}`,
        "",
        `*Entrega/Retirada:* ${friendlyDelivery}`,
        "",
        orderDetails.notes ? `*Observação:* ${orderDetails.notes}` : null,
        orderDetails.notes ? "" : null,
        paymentUrl
          ? "O pagamento já foi realizado via cartão. Fico no aguardo da confirmação de vocês!"
          : "Fico no aguardo da confirmação de vocês para enviar o sinal de 50%. Obrigado!"
      ].filter(item => item !== null).join("\n");

      const rawNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "";
      const cleanedNumber = rawNumber.replace(/\D/g, "");
      const url = `https://wa.me/${cleanedNumber}?text=${encodeURIComponent(message)}`;
      setWhatsappUrl(url);

      setStep("success");
      setQuantities({});
      localStorage.removeItem('cart_quantities');
      window.scrollTo({ top: 0, behavior: "smooth" });

      // Auto redirect after delay
      setTimeout(() => {
        if (paymentUrl) {
          window.location.href = paymentUrl; // Redirect to AbacatePay
        } else {
          window.open(url, '_blank'); // Open WhatsApp
        }
      }, 2000);
    } else {
      toast.error(res.error || "Ocorreu um erro ao enviar.");
    }
  };

  if (step === "success") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center min-h-[85vh] text-center space-y-12 w-full max-w-2xl mx-auto px-6"
      >
        <div className="relative">
          <motion.div
            initial={{ scale: 0, rotate: -45 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", damping: 15, stiffness: 150, delay: 0.2 }}
            className="h-32 w-32 bg-primary flex items-center justify-center text-white rounded-[2.5rem] shadow-2xl shadow-primary/30"
          >
            <CheckCircle2 size={56} strokeWidth={1.5} />
          </motion.div>

          <motion.div
            animate={{
              scale: [1, 1.4, 1],
              opacity: [0.2, 0.05, 0.2],
              rotate: [0, 90, 180, 270, 360]
            }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 bg-primary/20 rounded-[3rem] blur-3xl -z-10"
          />
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-4xl md:text-5xl font-display font-bold text-primary tracking-tight">Recebemos seu pedido!</h2>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.3em]">Obrigado pela preferência</p>
          </div>

          <p className="text-sm md:text-md text-muted-foreground max-w-md mx-auto leading-relaxed font-medium">
            Sua encomenda está em nossa fila de produção. Em instantes, nossa equipe entrará em contato via <b>WhatsApp</b> para confirmar os detalhes. {isOnlinePayment ? "Como o pagamento já foi realizado via cartão, basta aguardar a confirmação!" : "Ficamos no aguardo do envio do comprovante do sinal de 50%."}
          </p>
        </div>

        <div className="bg-primary/5 border border-primary/10 p-8 rounded-[2.5rem] w-full space-y-4">
          <div className="flex items-center justify-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <QrCode size={20} />
            </div>
            <div className="text-left">
              <p className="text-[10px] font-bold uppercase tracking-widest text-primary/60">Próximo Passo</p>
              <p className="text-xs font-bold">Fique atento ao seu WhatsApp</p>
            </div>
          </div>
        </div>

        <div className="pt-4 flex flex-col sm:flex-row gap-4 w-full justify-center">
          <Button
            onClick={() => router.push(`/acompanhar/${createdOrderId}`)}
            className="rounded-full px-12 h-14 text-[10px] font-bold uppercase tracking-widest bg-primary text-white shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer"
          >
            Acompanhar Pedido
          </Button>
          <Button
            onClick={() => {
              if (whatsappUrl) {
                window.open(whatsappUrl, '_blank');
              } else {
                const rawNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "";
                const cleanedNumber = rawNumber.replace(/\D/g, "");
                window.open(`https://wa.me/${cleanedNumber}`, '_blank');
              }
            }}
            variant="outline"
            className="rounded-full px-10 h-14 text-[10px] font-bold uppercase tracking-widest border-border/40 text-muted-foreground hover:bg-card/40 transition-all cursor-pointer"
          >
            Chamar no Whats
          </Button>
        </div>
        <div className="pt-4">
          <Button
            variant="ghost"
            onClick={() => router.push("/")}
            className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors cursor-pointer"
          >
            Voltar ao Início
          </Button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="min-h-screen bg-background w-full flex flex-col items-stretch">
      {/* Header Fixo Full Width */}
      <header className="sticky top-0 z-40 bg-background/60 backdrop-blur-xl border-b border-border/10 py-3 px-4 md:px-10 w-full">
        <div className="w-full flex items-center justify-between gap-2 max-w-[1600px] mx-auto">
          <div className="flex items-center gap-2 md:gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={handlePrevStep}
              className="h-9 w-9 md:h-10 md:w-10 rounded-full border border-border/10 hover:bg-primary/5 hover:text-primary transition-all group cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4 md:h-5 md:w-5 group-hover:-translate-x-0.5 transition-transform" />
            </Button>
            <div>
              <h2 className="text-lg md:text-xl font-display font-medium text-primary tracking-tight leading-tight">
                {step === "selection" ? "Encomenda" : "Checkout"}
              </h2>
              <div className="flex items-center gap-2 mt-0.5">
                <span className={`text-[9px] md:text-[10px] font-bold uppercase tracking-[0.1em] md:tracking-[0.2em] ${step === 'selection' ? 'text-primary' : 'text-muted-foreground/60'}`}>Seleção</span>
                <span className="text-muted-foreground/40 text-[9px]">/</span>
                <span className={`text-[9px] md:text-[10px] font-bold uppercase tracking-[0.1em] md:tracking-[0.2em] ${step === 'checkout' ? 'text-primary' : 'text-muted-foreground/60'}`}>Pagamento</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            {step === "selection" && totalItems > 0 && (
              <div className="flex items-center gap-2 md:gap-3">
                {/* Botão da Sacola para Mobile */}
                <div className="lg:hidden">
                  <Sheet>
                    <SheetTrigger render={
                      <Button variant="outline" size="icon" className="h-9 w-9 rounded-full border-primary/20 bg-primary/5 text-primary relative cursor-pointer">
                        <ShoppingBasket size={16} />
                        {totalItems > 0 && (
                          <span className="absolute -top-1 -right-1 h-4 w-4 bg-primary text-white text-[9px] font-bold rounded-full flex items-center justify-center border-2 border-background">
                            {totalItems}
                          </span>
                        )}
                      </Button>
                    } />
                    <SheetContent side="right" className="w-[85vw] sm:w-[400px] border-l-border/10 p-0 overflow-y-auto">
                      <div className="p-8 space-y-8">
                        <SheetHeader className="text-left space-y-1">
                          <SheetTitle className="text-2xl font-display font-bold text-primary">Sua Sacola</SheetTitle>
                          <p className="text-[10px] text-muted-foreground/80 font-bold uppercase tracking-[0.1em]">{totalItems} {totalItems === 1 ? 'item' : 'itens'}</p>
                        </SheetHeader>

                        <div className="space-y-4">
                          {selectedItems.length === 0 ? (
                            <div className="py-20 text-center space-y-4">
                              <ShoppingBag size={40} className="mx-auto text-muted-foreground/10" />
                              <p className="text-xs font-medium text-muted-foreground/60 italic">Sua sacola está vazia</p>
                            </div>
                          ) : (
                            <div className="space-y-4">
                              {selectedItems.map((item) => (
                                <div key={item.cartKey} className="flex justify-between items-center group bg-primary/[0.02] p-4 rounded-2xl border border-primary/5">
                                  <div className="flex-1">
                                    <p className="font-bold text-xs text-primary/80">{item.displayName}</p>
                                    <p className="text-[10px] text-muted-foreground/80 font-bold uppercase tracking-wider">R$ {parseFloat(item.price).toFixed(2)}</p>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <div className="flex items-center bg-background rounded-full border border-border/40 p-1">
                                      <button className="h-7 w-7 rounded-full flex items-center justify-center text-primary" onClick={() => handleQuantity(item.cartKey, -1)}><Minus size={12} /></button>
                                      <span className="text-xs font-bold w-6 text-center">{item.quantity}</span>
                                      <button className="h-7 w-7 rounded-full flex items-center justify-center text-primary" onClick={() => handleQuantity(item.cartKey, 1)}><Plus size={12} /></button>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="pt-8 border-t border-border/10 space-y-6">
                          <div className="flex justify-between items-center">
                            <span className="text-muted-foreground font-bold text-[11px] uppercase tracking-[0.2em]">Total</span>
                            <span className="text-3xl font-display font-bold text-primary tracking-tight">R$ {getSubtotal().toFixed(2).replace(".", ",")}</span>
                          </div>
                          <Button
                            onClick={handleNextStep}
                            className="w-full h-14 rounded-2xl text-xs font-bold uppercase tracking-widest bg-primary text-white shadow-xl shadow-primary/20"
                          >
                            Finalizar Pedido
                          </Button>
                        </div>
                      </div>
                    </SheetContent>
                  </Sheet>
                </div>
                <Button
                  onClick={handleNextStep}
                  className="rounded-full h-9 md:h-11 px-4 md:px-6 font-bold text-[10px] md:text-xs shadow-md group hover:scale-[1.01] active:scale-95 transition-all cursor-pointer bg-primary text-white"
                >
                  Prosseguir
                  <ArrowRight className="ml-1 md:ml-2 h-3 w-3 md:h-4 md:w-4 group-hover:translate-x-0.5 transition-transform" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="flex-1 w-full px-6 md:px-12 pb-20 mt-8">
        <AnimatePresence mode="wait">
          {step === "selection" ? (
            <motion.div
              key="selection"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full h-full"
            >
              <div className="flex flex-col lg:flex-row gap-12 items-start relative w-full h-full">
                {/* Lateral Esquerda: Sacola Única */}
                <aside className="hidden lg:block sticky top-32 w-[350px] flex-shrink-0 z-30">
                  <div className="bg-card/40 backdrop-blur-md border border-border/25 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.03)] rounded-3xl p-6 space-y-6">
                    <div className="flex items-center justify-between border-b border-border/5 pb-5">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
                          <ShoppingBasket size={20} />
                        </div>
                        <div>
                          <h3 className="text-lg font-display font-medium tracking-tight">Sua Sacola</h3>
                          <p className="text-[9px] text-muted-foreground/80 font-medium uppercase tracking-[0.1em]">{totalItems} {totalItems === 1 ? 'item' : 'itens'}</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {selectedItems.length === 0 ? (
                        <div className="py-16 text-center space-y-3">
                          <div className="h-16 w-16 mx-auto bg-muted/10 rounded-full flex items-center justify-center text-muted-foreground/20">
                            <ShoppingBag size={28} />
                          </div>
                          <p className="text-[11px] font-medium text-muted-foreground/60 italic px-6 leading-relaxed">Selecione produtos para começar</p>
                        </div>
                      ) : (
                        <div className="space-y-3 max-h-[35vh] overflow-y-auto pr-2 custom-scrollbar">
                          {selectedItems.map((item) => (
                            <motion.div layout key={item.cartKey} className="flex justify-between items-center group bg-primary/[0.02] p-3 rounded-xl border border-primary/5 hover:border-primary/10 transition-all">
                              <div className="flex-1 space-y-0.5">
                                <p className="font-medium text-[11px] leading-tight text-primary/80">{item.displayName}</p>
                                <p className="text-[9px] text-muted-foreground/80 font-medium uppercase tracking-wider">R$ {parseFloat(item.price).toFixed(2)}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="flex items-center bg-background/50 rounded-full border border-border/40 p-0.5">
                                  <button
                                    className="h-6 w-6 rounded-full flex items-center justify-center text-primary hover:bg-primary/5 cursor-pointer transition-colors"
                                    onClick={() => handleQuantity(item.cartKey, -1)}
                                  >
                                    <Minus size={10} />
                                  </button>
                                  <span className="text-[10px] font-bold w-5 text-center">{item.quantity}</span>
                                  <button
                                    className="h-6 w-6 rounded-full flex items-center justify-center text-primary hover:bg-primary/5 cursor-pointer transition-colors"
                                    onClick={() => handleQuantity(item.cartKey, 1)}
                                  >
                                    <Plus size={10} />
                                  </button>
                                </div>
                                <button
                                  className="h-7 w-7 text-muted-foreground/20 hover:text-destructive hover:bg-destructive/5 rounded-full transition-colors cursor-pointer flex items-center justify-center"
                                  onClick={() => handleQuantity(item.cartKey, -item.quantity)}
                                >
                                  <Trash2 size={12} />
                                </button>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      )}

                      <div className="space-y-4 pt-4 border-t border-border/5">
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground font-medium text-[10px] uppercase tracking-wider">Total</span>
                          <span className="text-2xl font-display font-medium text-primary tracking-tight">R$ {getSubtotal().toFixed(2).replace(".", ",")}</span>
                        </div>

                        <Button
                          onClick={handleNextStep}
                          disabled={totalItems === 0}
                          className="w-full h-12 rounded-2xl text-[11px] font-bold uppercase tracking-widest shadow-lg shadow-primary/10 hover:shadow-xl hover:shadow-primary/20 hover:scale-[1.01] active:scale-95 transition-all cursor-pointer group bg-primary text-white border-b-2 border-primary-dark/20"
                        >
                          Checkout
                          <ChevronRight size={14} className="ml-1 group-hover:translate-x-0.5 transition-transform" />
                        </Button>

                        <div className="bg-primary/5 p-5 rounded-2xl border border-primary/10 flex items-start gap-4">
                          <AlertCircle size={20} className="text-primary shrink-0 mt-0.5" />
                          <p className="text-[11px] text-muted-foreground leading-relaxed font-bold">
                            Pedimos <span className="text-primary font-bold underline decoration-2 underline-offset-4">50% de entrada</span> para confirmar a produção.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </aside>

                {/* Direita: Catálogo */}
                <main className="flex-1 space-y-8">
                  <div className="flex flex-col md:flex-row gap-6 md:items-center justify-between">
                    <div className="relative group flex-1 max-w-md">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/70 group-focus-within:text-primary transition-colors" />
                      <Input
                        placeholder="Pesquisar..."
                        className="pl-11 h-11 rounded-full bg-background border-border/40 focus-visible:ring-primary/5 cursor-text text-sm shadow-sm transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>

                    <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest bg-muted/20 px-4 py-2 rounded-full border border-border/20">
                      {filteredProducts.length} itens encontrados
                    </div>
                  </div>

                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 w-full">
                    {filteredProducts.map((p) => {
                      const q = quantities[p.id] || 0;
                      return (
                        <motion.div
                          layout
                          key={p.id}
                          className={`group bg-white dark:bg-card/40 rounded-2xl border border-border/40 transition-all duration-300 overflow-hidden flex flex-col h-full hover:shadow-lg hover:shadow-primary/5 ${q > 0 ? 'border-primary' : 'hover:border-primary/40'}`}
                        >
                          <div className="aspect-[16/10] relative overflow-hidden m-3 rounded-xl border border-border/15">
                            {p.imageUrl ? (
                              <img src={p.imageUrl} alt={p.name} className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-105" />
                            ) : (
                              <div className="w-full h-full bg-muted/20 flex items-center justify-center">
                                <Package size={24} className="text-primary/10" />
                              </div>
                            )}

                            {q > 0 && (
                              <motion.div
                                initial={{ scale: 0.5, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="absolute top-3 right-3 bg-primary text-white h-7 w-7 rounded-full flex items-center justify-center font-bold text-xs shadow-lg"
                              >
                                {q}
                              </motion.div>
                            )}
                          </div>

                          <div className="px-5 pb-5 flex flex-col flex-1 space-y-4">
                            <div>
                              <h4 className="font-display font-medium text-base group-hover:text-primary transition-colors duration-300">{p.name}</h4>
                              <p className="text-[11px] text-muted-foreground/90 font-medium line-clamp-2 mt-1 leading-relaxed">{p.description || "Receita artesanal feita com ingredientes selecionados."}</p>
                            </div>

                            <div className="pt-2 flex items-center justify-between mt-auto">
                              <span className="font-display font-medium text-lg text-primary">R$ {parseFloat(p.price).toFixed(2).replace(".", ",")}</span>

                              <div className="flex items-center gap-1">
                                {q > 0 ? (
                                  <div className="flex items-center bg-muted/40 rounded-full p-1 border border-border/20">
                                    <button
                                      className="h-7 w-7 rounded-full flex items-center justify-center hover:bg-background transition-colors cursor-pointer text-muted-foreground hover:text-primary"
                                      onClick={() => handleQuantity(p.id, -1)}
                                    >
                                      <Minus size={12} />
                                    </button>
                                    <span className="text-xs font-semibold w-6 text-center">{q}</span>
                                    <button
                                      className="h-7 w-7 rounded-full flex items-center justify-center hover:bg-background transition-colors cursor-pointer text-muted-foreground hover:text-primary"
                                      onClick={() => handleQuantity(p.id, 1)}
                                    >
                                      <Plus size={12} />
                                    </button>
                                  </div>
                                ) : (
                                  <Button
                                    variant="outline"
                                    onClick={() => handleQuantity(p.id, 1)}
                                    className="rounded-full h-8 px-4 text-[11px] font-medium border-primary/20 text-primary hover:bg-primary hover:text-white transition-all cursor-pointer"
                                  >
                                    Adicionar
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </main>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="checkout"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="w-full h-full flex flex-col lg:flex-row gap-16 items-start max-w-[1400px] mx-auto justify-center"
            >
              <div className="flex-1">
                <form onSubmit={handleSubmit} className="space-y-10">
                  <div className="grid md:grid-cols-2 gap-10">
                    {/* Entrega ou Retirada */}
                    <div className="space-y-5">
                      <Label className="text-xs font-bold text-muted-foreground/80 uppercase tracking-widest flex items-center gap-2 ml-1">
                        <Truck size={14} />
                        Como deseja receber?
                      </Label>
                      <RadioGroup defaultValue="PICKUP" value={deliveryType} onValueChange={setDeliveryType} className="grid grid-cols-2 gap-4">
                        <Label htmlFor="pickup" className={`flex flex-col items-center justify-center rounded-[1.5rem] border p-5 cursor-pointer transition-all ${deliveryType === "PICKUP" ? 'border-primary bg-primary/[0.03] ring-1 ring-primary/10' : 'border-border/30 bg-card/20 hover:border-primary/30'}`}>
                          <RadioGroupItem value="PICKUP" id="pickup" className="sr-only" />
                          <Building2 size={24} className={`mb-2 ${deliveryType === "PICKUP" ? 'text-primary' : 'text-muted-foreground/20'}`} />
                          <span className={`text-[10px] font-bold uppercase tracking-widest ${deliveryType === "PICKUP" ? 'text-primary' : 'text-muted-foreground/60'}`}>Retirar</span>
                        </Label>
                        <Label htmlFor="delivery" className={`flex flex-col items-center justify-center rounded-[1.5rem] border p-5 cursor-pointer transition-all ${deliveryType === "DELIVERY" ? 'border-primary bg-primary/[0.03] ring-1 ring-primary/10' : 'border-border/30 bg-card/20 hover:border-primary/30'}`}>
                          <RadioGroupItem value="DELIVERY" id="delivery" className="sr-only" />
                          <Truck size={24} className={`mb-2 ${deliveryType === "DELIVERY" ? 'text-primary' : 'text-muted-foreground/20'}`} />
                          <span className={`text-[10px] font-bold uppercase tracking-widest ${deliveryType === "DELIVERY" ? 'text-primary' : 'text-muted-foreground/60'}`}>Delivery</span>
                        </Label>
                      </RadioGroup>

                      {deliveryType === "DELIVERY" && (
                        <motion.div
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-primary/5 p-4 rounded-xl border border-primary/10 mt-2"
                        >
                          <p className="text-[10px] text-primary font-bold leading-relaxed">
                            <AlertCircle size={10} className="inline mr-1" />
                            Lembre-se: Para entregas, poderá haver acréscimo de frete. O valor será informado na confirmação.
                          </p>
                        </motion.div>
                      )}

                      <AnimatePresence mode="wait">
                        {deliveryType === "PICKUP" && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-3 pt-2"
                          >
                            <Label className="text-[10px] font-bold text-muted-foreground/80 uppercase tracking-wider ml-1">Onde deseja retirar?</Label>
                            <RadioGroup value={pickupPoint} onValueChange={setPickupPoint} className="grid grid-cols-2 gap-2">
                              <Label htmlFor="loja" className={`text-center py-2.5 rounded-xl border text-[10px] font-bold uppercase tracking-widest cursor-pointer transition-all ${pickupPoint === "LOJA" ? 'bg-primary/5 border-primary/20 text-primary' : 'bg-background/40 border-border/30 text-muted-foreground/60'}`}>
                                <RadioGroupItem value="LOJA" id="loja" className="sr-only" />
                                Na Loja
                              </Label>
                              <Label htmlFor="feira" className={`text-center py-2.5 rounded-xl border text-[10px] font-bold uppercase tracking-widest cursor-pointer transition-all ${pickupPoint === "FEIRA" ? 'bg-primary/5 border-primary/20 text-primary' : 'bg-background/40 border-border/30 text-muted-foreground/60'}`}>
                                <RadioGroupItem value="FEIRA" id="feira" className="sr-only" />
                                Na Feira
                              </Label>
                            </RadioGroup>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Forma de Pagamento */}
                    <div className="space-y-4">
                      <Label className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest flex items-center gap-2 ml-1">
                        <CreditCard size={12} />
                        Pagamento
                      </Label>
                      <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="grid grid-cols-2 gap-2">
                        {[
                          { id: "PIX", label: "Pix", icon: QrCode },
                          { id: "CASH", label: "Dinheiro", icon: Wallet, disabled: deliveryType === "DELIVERY" },
                          { id: "CREDIT", label: "Cartão de Crédito", icon: CreditCard },
                        ].filter(m => !m.disabled).map((m) => (
                          <Label
                            key={m.id}
                            htmlFor={m.id}
                            className={`flex flex-col items-center justify-center aspect-square rounded-2xl border p-4 cursor-pointer transition-all ${paymentMethod === m.id ? 'border-primary bg-primary/[0.03] text-primary shadow-sm' : 'border-border/60 bg-card/10 text-muted-foreground/60 hover:border-primary/40'}`}
                          >
                            <RadioGroupItem value={m.id} id={m.id} className="sr-only" />
                            <m.icon size={20} className="mb-2" />
                            <span className="text-[11px] font-bold uppercase tracking-widest">{m.label}</span>
                          </Label>
                        ))}
                      </RadioGroup>
                      <p className="text-[10px] text-muted-foreground/80 font-bold uppercase tracking-widest px-1 italic">Finalização via WhatsApp</p>
                    </div>
                  </div>

                  <AnimatePresence>
                    {deliveryType === "DELIVERY" && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="space-y-6 bg-primary/[0.02] p-7 rounded-3xl border border-primary/5 mb-8">
                          <h4 className="text-[10px] font-bold text-primary/80 uppercase tracking-widest flex items-center gap-2 ml-1">
                            <MapPin size={12} />
                            Endereço de Entrega
                          </h4>
                          <div className="grid gap-5 md:grid-cols-4">
                            <div className="md:col-span-3 space-y-2">
                              <Label htmlFor="street" className="text-[10px] uppercase tracking-wider text-muted-foreground/80 font-bold ml-1">Rua / Logradouro</Label>
                              <Input id="street" name="street" value={orderDetails.street} onChange={handleInputChange} placeholder="Ex: Rua das Flores" className="h-12 rounded-2xl bg-background border-border/60 px-5 text-sm font-medium focus:ring-primary/5 transition-all w-full" />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="number" className="text-[10px] uppercase tracking-wider text-muted-foreground/80 font-bold ml-1">Nº</Label>
                              <Input id="number" name="number" value={orderDetails.number} onChange={handleInputChange} placeholder="123" className="h-12 rounded-2xl bg-background border-border/60 px-5 text-sm font-medium focus:ring-primary/5 transition-all w-full" />
                            </div>
                            <div className="md:col-span-2 space-y-2">
                              <Label htmlFor="neighborhood" className="text-[10px] uppercase tracking-wider text-muted-foreground/80 font-bold ml-1">Bairro</Label>
                              <Input id="neighborhood" name="neighborhood" value={orderDetails.neighborhood} onChange={handleInputChange} placeholder="Ex: Centro" className="h-12 rounded-2xl bg-background border-border/60 px-5 text-sm font-medium focus:ring-primary/5 transition-all w-full" />
                            </div>
                            <div className="md:col-span-2 space-y-2">
                              <Label htmlFor="reference" className="text-[10px] uppercase tracking-wider text-muted-foreground/80 font-bold ml-1">Referência</Label>
                              <Input id="reference" name="reference" value={orderDetails.reference} onChange={handleInputChange} placeholder="Perto de..." className="h-12 rounded-2xl bg-background border-border/60 px-5 text-sm font-medium focus:ring-primary/5 transition-all w-full" />
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="grid md:grid-cols-2 gap-10">
                    <div className="space-y-3">
                      <Label className="text-[10px] font-bold text-muted-foreground/80 uppercase tracking-widest flex items-center gap-2 ml-1">
                        <Package size={12} />
                        Quando {deliveryType === "PICKUP" ? "vai retirar" : "vai receber"}?
                      </Label>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="scheduledDate" className="text-[10px] uppercase tracking-widest text-muted-foreground/60 font-bold ml-1">Data</Label>
                          <Input id="scheduledDate" name="scheduledDate" type="date" value={orderDetails.scheduledDate} onChange={handleInputChange} className="h-12 rounded-2xl bg-background border-border/40 px-5 text-sm font-medium focus:ring-primary/5 cursor-pointer" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="scheduledTime" className="text-[10px] uppercase tracking-widest text-muted-foreground/60 font-bold ml-1">Horário (Opcional)</Label>
                          <Input id="scheduledTime" name="scheduledTime" type="time" value={orderDetails.scheduledTime} onChange={handleInputChange} className="h-12 rounded-2xl bg-background border-border/40 px-5 text-sm font-medium focus:ring-primary/5 cursor-pointer" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Aviso de Pagamento Antecipado */}
                  <div className="bg-amber-500/[0.03] border border-amber-500/10 rounded-[2rem] p-6 flex items-start gap-4 shadow-sm shadow-amber-500/5">
                    <div className="h-10 w-10 rounded-full bg-amber-500/10 flex items-center justify-center shrink-0">
                      <AlertCircle size={18} className="text-amber-600" />
                    </div>
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold text-amber-900/80 uppercase tracking-wider">Atenção: Finalização do Pedido</h4>
                      <p className="text-xs text-amber-900/80 leading-relaxed font-bold">A produção inicia apenas após a confirmação do pagamento de <span className="text-amber-700 underline decoration-2 underline-offset-4">50% do valor (Sinal) via PIX</span> no WhatsApp.</p>
                    </div>
                  </div>

                  <div className="space-y-8">
                    <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-[0.2em] flex items-center gap-2 border-b border-border/10 pb-5 ml-1">
                      <ShoppingBag size={14} className="text-primary/60" />
                      Seus Dados
                    </h4>
                    <div className="space-y-6">
                      {session?.user && (
                        <div className="bg-primary/[0.03] p-5 rounded-[2rem] border border-primary/10 flex items-center justify-between animate-in fade-in duration-500">
                          <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-display font-bold text-sm">
                              {orderDetails.customerName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                            </div>
                            <div className="space-y-0.5">
                              <p className="text-xs font-bold text-foreground leading-none">{orderDetails.customerName}</p>
                              <p className="text-[10px] text-muted-foreground font-medium">{orderDetails.customerEmail} • {orderDetails.customerPhone || 'WhatsApp não cadastrado'}</p>
                              <div className="flex items-center gap-1.5 mt-1">
                                <CheckCircle2 size={10} className="text-primary" />
                                <span className="text-[9px] font-bold text-primary uppercase tracking-[0.1em]">Dados Carregados</span>
                              </div>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            type="button"
                            onClick={() => router.push('/perfil')}
                            className="text-[9px] font-black uppercase tracking-[0.2em] text-primary hover:bg-primary/5 h-8 px-3 rounded-full"
                          >
                            Editar
                          </Button>
                        </div>
                      )}

                      {!session?.user && (
                        <div className="grid gap-6 md:grid-cols-2">
                          <div className="space-y-2">
                            <Label htmlFor="customerName" className="text-xs uppercase tracking-wider text-muted-foreground/80 font-bold ml-1">Nome Completo</Label>
                            <Input id="customerName" name="customerName" value={orderDetails.customerName} onChange={handleInputChange} placeholder="Como deseja ser chamado?" required className="h-12 rounded-2xl bg-card/10 border-border/60 px-6 text-sm font-medium focus:ring-primary/5 transition-all w-full cursor-text" />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="customerPhone" className="text-xs uppercase tracking-wider text-muted-foreground/80 font-bold ml-1">WhatsApp</Label>
                            <Input id="customerPhone" name="customerPhone" type="tel" value={orderDetails.customerPhone} onChange={handleInputChange} placeholder="(00) 00000-0000" className="h-12 rounded-2xl bg-card/10 border-border/60 px-6 text-sm font-medium focus:ring-primary/5 transition-all w-full cursor-text" />
                          </div>
                          <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="customerEmail" className="text-xs uppercase tracking-wider text-muted-foreground/80 font-bold ml-1">E-mail</Label>
                            <Input id="customerEmail" name="customerEmail" type="email" value={orderDetails.customerEmail} onChange={handleInputChange} placeholder="exemplo@gmail.com" required className="h-12 rounded-2xl bg-card/10 border-border/60 px-6 text-sm font-medium focus:ring-primary/5 transition-all w-full cursor-text" />
                          </div>
                        </div>
                      )}

                      <div className="space-y-2 w-full">
                        <Label htmlFor="notes" className="text-xs uppercase tracking-wider text-muted-foreground/80 font-bold ml-1">Observações do Pedido</Label>
                        <textarea id="notes" name="notes" value={orderDetails.notes} onChange={handleInputChange} className="flex min-h-[120px] w-full rounded-[2rem] border border-border/60 bg-card/10 px-6 py-5 text-sm font-medium focus:ring-primary/5 resize-none transition-all placeholder:font-normal cursor-text" placeholder="Algum detalhe especial para nos contar?" />
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-6 pt-2">
                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full sm:w-auto h-12 px-12 rounded-full text-xs font-bold transition-all group cursor-pointer bg-primary text-white shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 hover:scale-[1.02] active:scale-95 border-b-2 border-primary-dark/20"
                    >
                      {loading ? "Processando..." : (
                        <span className="flex items-center gap-2">
                          Confirmar Encomenda
                          <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                        </span>
                      )}
                    </Button>
                    <p className="text-[10px] text-muted-foreground/70 font-bold max-w-[180px] italic leading-relaxed uppercase tracking-widest">
                      Finalização artesanal e humana via WhatsApp.
                    </p>
                  </div>
                </form>
              </div>

              <aside className="lg:w-[380px] lg:sticky lg:top-32 h-fit w-full flex justify-center">
                <div className="bg-card/20 backdrop-blur-md border border-border/60 rounded-[2.5rem] p-10 space-y-8 w-full shadow-xl flex flex-col items-center text-center relative overflow-hidden">
                  <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
                  <h3 className="text-[11px] font-bold text-muted-foreground/40 uppercase tracking-[0.4em] ml-1">Resumo</h3>

                  <div className="space-y-3 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
                    {selectedItems.map((item) => (
                      <div key={item.cartKey} className="flex flex-col items-center gap-1.5 peer group">
                        <div className="space-y-1">
                          <p className="font-bold text-xs text-primary/80 group-hover:text-primary transition-colors">{item.displayName}</p>
                          <p className="text-[9px] text-muted-foreground/60 font-bold uppercase tracking-widest">{item.quantity} UN · R$ {parseFloat(item.price).toFixed(2).replace(".", ",")}</p>
                        </div>
                        <p className="text-[13px] font-display font-bold text-primary">R$ {(item.quantity * parseFloat(item.price)).toFixed(2).replace(".", ",")}</p>
                        <div className="w-8 h-px bg-border/10 mt-2 group-last:hidden" />
                      </div>
                    ))}
                  </div>

                  <div className="space-y-4 pt-2 w-full flex flex-col items-center">
                    <div className="flex flex-col items-center gap-2">
                      <span className="text-muted-foreground text-[10px] uppercase tracking-[0.3em] font-black opacity-30">Subtotal</span>
                      <span className="text-5xl font-display font-bold text-primary tracking-tighter">R$ {getSubtotal().toFixed(2).replace(".", ",")}</span>
                    </div>
                  </div>

                  <div className="p-7 bg-primary/[0.03] rounded-[2.5rem] border border-primary/10 space-y-3 w-full flex flex-col items-center shadow-inner">
                    <div className="flex items-center gap-2 opacity-50">
                      <AlertCircle size={12} className="text-primary" />
                      <span className="text-[9px] font-bold uppercase tracking-widest">Sinal via PIX (50%)</span>
                    </div>
                    <p className="text-3xl font-display font-bold tracking-tight text-primary">R$ {(getSubtotal() / 2).toFixed(2).replace(".", ",")}</p>
                  </div>
                </div>
              </aside>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(var(--primary), 0.15);
          border-radius: 40px;
          border: 2px solid transparent;
          background-clip: content-box;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(var(--primary), 0.4);
          background-clip: content-box;
        }
        body {
          overflow-x: hidden;
          width: 100vw;
        }
        html {
          overflow-x: hidden;
          width: 100vw;
        }
      `}</style>
    </div>
  );
}

export default function OrderForm({ initialProducts }: { initialProducts: ProductDTO[] }) {
  return (
    <Suspense fallback={<div className="flex flex-col items-center justify-center min-h-screen space-y-8 bg-background">
      <motion.div
        animate={{
          rotate: 360,
          scale: [1, 1.1, 1],
          borderRadius: ["30%", "50%", "30%"]
        }}
        transition={{
          rotate: { repeat: Infinity, duration: 2, ease: "linear" },
          scale: { repeat: Infinity, duration: 1.5 },
          borderRadius: { repeat: Infinity, duration: 2 }
        }}
        className="h-24 w-24 rounded-full border-8 border-primary/10 border-t-primary shadow-2xl shadow-primary/20"
      />
      <div className="text-center space-y-2">
        <p className="text-primary font-display text-4xl font-bold italic tracking-tight animate-pulse">Raízes do Sul</p>
        <p className="text-muted-foreground font-bold uppercase tracking-[0.4em] text-xs">Artesanal & Tradição</p>
      </div>
    </div>}>
      <OrderFormContent initialProducts={initialProducts} />
    </Suspense>
  );
}
