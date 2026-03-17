"use client"
import { Button } from "@/components/ui/button";
import { deleteProductAction } from "@/actions/product";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export function DeleteButton({ id }: { id: string }) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    toast("Remover produto?", {
      description: "Esta ação não pode ser desfeita.",
      action: {
        label: "Remover",
        onClick: async () => {
          setLoading(true);
          const result = await deleteProductAction(id);
          setLoading(false);

          if (result.success) {
            toast.success("Produto removido com sucesso!");
          } else {
            toast.error(result.error || "Erro ao remover produto.");
          }
        },
      },
      cancel: {
        label: "Cancelar",
        onClick: () => {},
      },
    });
  };

  return (
    <Button
      variant="destructive"
      size="sm"
      onClick={handleDelete}
      disabled={loading}
      className="rounded-full cursor-pointer hover:bg-destructive/90 px-4"
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Remover"}
    </Button>
  )
}
