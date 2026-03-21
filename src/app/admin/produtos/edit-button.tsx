"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import { EditProductModal } from "./edit-product-modal";

interface Flavor {
  id: string;
  name: string;
  price: string;
  imageUrl: string | null;
  isAvailable: boolean;
}

interface ProductToEdit {
  id: string;
  name: string;
  price: string;
  description: string | null;
  category: string | null;
  images: string[];
  flavors: Flavor[];
}

interface EditButtonProps {
  product: ProductToEdit;
}

export function EditButton({ product }: EditButtonProps) {
  const [open, setOpen] = useState<boolean>(false);

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        className="rounded-full cursor-pointer border-border/60 hover:border-primary/50 hover:bg-primary/5 hover:text-primary transition-all px-4 gap-1.5"
      >
        <Pencil className="w-3.5 h-3.5" />
        Editar
      </Button>

      <EditProductModal
        product={product}
        open={open}
        onOpenChange={setOpen}
      />
    </>
  );
}
