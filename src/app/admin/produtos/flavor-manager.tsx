"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2, ImageOff } from "lucide-react";
import Image from "next/image";
import { FlavorModal } from "./flavor-modal";
import { deleteFlavorAction, toggleFlavorAvailabilityAction } from "@/actions/flavor";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Switch } from "@/components/ui/switch";

interface Flavor {
  id: string;
  name: string;
  price: string;
  imageUrl: string | null;
  isAvailable: boolean;
}

interface FlavorManagerProps {
  productId: string;
  flavors: Flavor[];
}

export function FlavorManager({ productId, flavors }: FlavorManagerProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingFlavor, setEditingFlavor] = useState<Flavor | null>(null);

  function handleAddClick() {
    setEditingFlavor(null);
    setModalOpen(true);
  }

  function handleEditClick(flavor: Flavor) {
    setEditingFlavor(flavor);
    setModalOpen(true);
  }

  async function handleDelete(flavorId: string, flavorName: string) {
    if (!confirm(`Remover o sabor "${flavorName}"?`)) return;

    startTransition(async () => {
      const result = await deleteFlavorAction(flavorId);
      if (result.success) {
        toast.success("Sabor removido!");
        router.refresh();
      } else {
        toast.error(result.error ?? "Erro ao remover sabor.");
      }
    });
  }

  async function handleToggleAvailability(flavorId: string) {
    startTransition(async () => {
      const result = await toggleFlavorAvailabilityAction(flavorId);
      if (result.success) {
        router.refresh();
      } else {
        toast.error(result.error ?? "Erro ao alterar disponibilidade.");
      }
    });
  }

  function handleSuccess() {
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-lg font-semibold text-foreground">
          Sabores
        </h3>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={handleAddClick}
          className="rounded-xl cursor-pointer"
        >
          <Plus className="w-4 h-4 mr-1" />
          Adicionar
        </Button>
      </div>

      {flavors.length === 0 ? (
        <div className="border border-dashed border-border/60 rounded-xl p-6 text-center">
          <p className="text-sm text-muted-foreground">
            Nenhum sabor cadastrado.
          </p>
          <p className="text-xs text-muted-foreground/70 mt-1">
            Produtos sem sabor usam o preço base.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {flavors.map((flavor) => (
            <div
              key={flavor.id}
              className={`flex items-center gap-3 p-3 border rounded-xl transition-all ${
                flavor.isAvailable
                  ? "border-border/60 bg-background"
                  : "border-border/30 bg-secondary/20 opacity-60"
              }`}
            >
              {/* Imagem */}
              <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-secondary/30 flex-shrink-0">
                {flavor.imageUrl ? (
                  <Image
                    src={flavor.imageUrl}
                    alt={flavor.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageOff className="w-4 h-4 text-muted-foreground/40" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground truncate">
                  {flavor.name}
                </p>
                <p className="text-sm text-primary font-semibold">
                  R${" "}
                  {parseFloat(flavor.price).toLocaleString("pt-BR", {
                    minimumFractionDigits: 2,
                  })}
                </p>
              </div>

              {/* Disponibilidade */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground hidden sm:block">
                  {flavor.isAvailable ? "Disponível" : "Indisponível"}
                </span>
                <Switch
                  checked={flavor.isAvailable}
                  onCheckedChange={() => handleToggleAvailability(flavor.id)}
                  disabled={isPending}
                  className="cursor-pointer"
                />
              </div>

              {/* Ações */}
              <div className="flex items-center gap-1">
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  onClick={() => handleEditClick(flavor)}
                  disabled={isPending}
                  className="w-8 h-8 rounded-lg cursor-pointer"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </Button>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  onClick={() => handleDelete(flavor.id, flavor.name)}
                  disabled={isPending}
                  className="w-8 h-8 rounded-lg text-destructive hover:text-destructive cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <FlavorModal
        productId={productId}
        flavor={editingFlavor}
        open={modalOpen}
        onOpenChange={setModalOpen}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
