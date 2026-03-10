"use client"
import { Button } from "@/components/ui/button";
import { deleteProductAction } from "@/actions/product";
import { Loader2 } from "lucide-react";
import { useState } from "react";

export function DeleteButton({ id }: { id: string }) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    await deleteProductAction(id);
    setLoading(false);
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
