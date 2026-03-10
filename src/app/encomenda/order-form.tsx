"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { createOrder } from "../actions/order";

import { BackButton } from "@/components/ui/back-button";
import { Search } from "lucide-react";

type ProductDTO = {
  id: string;
  name: string;
  description: string | null;
  price: string;
  imageUrl: string | null;
};

function OrderFormContent({ initialProducts }: { initialProducts: ProductDTO[] }) {
  const [quantities, setQuantities] = useState<{ [key: string]: number }>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Handle prepopulation from URL
  useEffect(() => {
    const productId = searchParams.get("productId");
    if (productId && initialProducts.some(p => p.id === productId)) {
      setQuantities(prev => {
        if (prev[productId]) return prev; // Already handled or manually changed
        return { ...prev, [productId]: 1 };
      });
    }
  }, [searchParams, initialProducts]);

  const filteredProducts = initialProducts.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleQuantity = (id: string, delta: number) => {
    setQuantities((prev) => {
      const next = (prev[id] || 0) + delta;
      return { ...prev, [id]: Math.max(0, next) };
    });
  };

  const getSubtotal = () => {
    let total = 0;
    initialProducts.forEach((p) => {
      const q = quantities[p.id] || 0;
      total += parseFloat(p.price) * q;
    });
    return total;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const customerName = formData.get("customerName") as string;
    const customerEmail = formData.get("customerEmail") as string;
    const customerPhone = formData.get("customerPhone") as string;
    const notes = formData.get("notes") as string;

    const items = initialProducts
      .filter((p) => (quantities[p.id] || 0) > 0)
      .map((p) => ({
        productId: p.id,
        name: p.name, // Send name for mock/catalog support
        quantity: quantities[p.id],
        price: parseFloat(p.price),
      }));

    if (items.length === 0) {
      toast.error("Por favor, selecione pelo menos um produto.");
      return;
    }

    if (!customerName || !customerEmail) {
      toast.error("Nome e E-mail são obrigatórios.");
      return;
    }

    setLoading(true);
    const res = await createOrder({
      customerName,
      customerEmail,
      customerPhone,
      notes,
      items,
    });
    setLoading(false);

    if (res.success) {
      toast.success("Encomenda enviada com sucesso! Em breve entraremos em contato.");
      setQuantities({});
      (e.target as HTMLFormElement).reset();
      router.push("/");
    } else {
      toast.error(res.error || "Ocorreu um erro. Tente novamente.");
    }
  };

  const selectedProducts = initialProducts.filter(p => (quantities[p.id] || 0) > 0);

  return (
    <form onSubmit={handleSubmit} className="space-y-10 md:space-y-16">
      <div className="flex flex-col gap-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <BackButton />
            <div className="border-l border-border/50 pl-6 py-1">
              <h2 className="text-2xl font-display font-semibold">Sua Encomenda</h2>
              <p className="text-muted-foreground text-sm">Revise os itens e adicione mais se desejar.</p>
            </div>
          </div>
        </div>

        {/* Selected Items / "Cart" View */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Itens Selecionados</h3>
          {selectedProducts.length === 0 ? (
            <div className="p-8 border-2 border-dashed border-border/50 rounded-2xl text-center bg-secondary/5">
              <p className="text-muted-foreground">Nenhum item selecionado. Procure no cardápio abaixo.</p>
            </div>
          ) : (
            <div className="grid gap-3 sm:gap-4 grid-cols-1 md:grid-cols-2">
              {selectedProducts.map((p) => {
                const q = quantities[p.id] || 0;
                return (
                  <div key={p.id} className="flex items-center justify-between p-4 bg-primary/5 border border-primary/20 rounded-2xl shadow-sm">
                    <div className="flex flex-col">
                      <span className="font-bold text-foreground">{p.name}</span>
                      <span className="text-xs text-primary font-semibold">
                        R$ {parseFloat(p.price).toFixed(2).replace(".", ",")}
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-3 bg-background rounded-full border border-border/50 p-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 rounded-full text-primary hover:bg-primary/10"
                          onClick={() => handleQuantity(p.id, -1)}
                        >
                          -
                        </Button>
                        <span className="font-bold w-4 text-center text-sm">{q}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 rounded-full text-primary hover:bg-primary/10"
                          onClick={() => handleQuantity(p.id, 1)}
                        >
                          +
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Catalog / Search Section */}
        <div className="pt-8 border-t border-border/50 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Adicionar mais itens</h3>
            <div className="relative group max-w-sm w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input
                placeholder="Procurar no cardápio..."
                className="pl-10 h-10 rounded-xl bg-secondary/10 border-border/50 focus-visible:ring-primary/20 cursor-text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {(searchTerm || selectedProducts.length === 0) && (
            <div className="grid gap-3 grid-cols-2 lg:grid-cols-3">
              {filteredProducts.filter(p => (quantities[p.id] || 0) === 0).map((p) => (
                <div key={p.id} className="flex flex-col border border-border/50 rounded-xl p-3 bg-card hover:border-primary/30 transition-all group">
                  <div className="flex flex-col mb-2">
                    <h4 className="font-semibold text-sm line-clamp-1">{p.name}</h4>
                    <span className="font-bold text-primary text-xs">R$ {parseFloat(p.price).toFixed(2).replace(".", ",")}</span>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8 rounded-full text-[10px] w-full mt-auto font-bold hover:bg-primary hover:text-white transition-all cursor-pointer"
                    onClick={() => handleQuantity(p.id, 1)}
                  >
                    + Incluir
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-4 flex justify-end items-center gap-2 p-4 bg-primary/5 rounded-2xl border border-primary/10">
          <p className="text-sm md:text-md text-muted-foreground font-medium italic">Total da Encomenda:</p>
          <p className="text-xl md:text-2xl font-bold text-primary">
            R$ {getSubtotal().toFixed(2).replace(".", ",")}
          </p>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-display font-semibold mb-6 border-b pb-2">Passo 2: Seus Dados</h2>
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-3">
            <Label htmlFor="customerName" className="font-medium">Nome Completo <span className="text-red-500">*</span></Label>
            <Input id="customerName" name="customerName" placeholder="Ex: Maria Antonieta" required className="h-12 cursor-text" />
          </div>
          <div className="space-y-3">
            <Label htmlFor="customerEmail" className="font-medium">E-mail <span className="text-red-500">*</span></Label>
            <Input id="customerEmail" name="customerEmail" type="email" placeholder="maria@exemplo.com" required className="h-12 cursor-text" />
          </div>
          <div className="space-y-3">
            <Label htmlFor="customerPhone" className="font-medium">Telefone / WhatsApp</Label>
            <Input id="customerPhone" name="customerPhone" type="tel" placeholder="(51) 99999-9999" className="h-12 cursor-text" />
          </div>
          <div className="space-y-3 sm:col-span-2">
            <Label htmlFor="notes" className="font-medium">Instruções Especiais ou Observações</Label>
            <textarea
              id="notes"
              name="notes"
              className="flex min-h-[120px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 cursor-text resize-none"
              placeholder="Ex: Alergia a nozes, entrega pela manhã, sem açúcar na cobertura..."
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <Button
          type="submit"
          size="lg"
          disabled={loading || getSubtotal() === 0}
          className="h-14 px-8 text-lg font-medium w-full sm:w-auto rounded-xl cursor-pointer shadow-lg hover:shadow-xl hover:scale-105 transition-all"
        >
          {loading ? "Enviando..." : "Finalizar Encomenda"}
        </Button>
      </div>
    </form >
  );
}

export default function OrderForm({ initialProducts }: { initialProducts: ProductDTO[] }) {
  return (
    <Suspense fallback={<div className="flex items-center justify-center p-20"><p className="text-muted-foreground">Carregando formulário...</p></div>}>
      <OrderFormContent initialProducts={initialProducts} />
    </Suspense>
  );
}
