"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, X, ImagePlus } from "lucide-react";
import Image from "next/image";
import { createFlavorAction, updateFlavorAction } from "@/actions/flavor";
import { toast } from "sonner";

interface Flavor {
  id: string;
  name: string;
  price: string;
  imageUrl: string | null;
  isAvailable: boolean;
}

interface FlavorModalProps {
  productId: string;
  flavor?: Flavor | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function FlavorModal({
  productId,
  flavor,
  open,
  onOpenChange,
  onSuccess,
}: FlavorModalProps) {
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(flavor?.imageUrl ?? null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [keepExistingImage, setKeepExistingImage] = useState(!!flavor?.imageUrl);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const isEditing = !!flavor;

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
      setKeepExistingImage(false);
    }
  }

  function removeImage() {
    if (preview && !flavor?.imageUrl) {
      URL.revokeObjectURL(preview);
    }
    setPreview(null);
    setSelectedFile(null);
    setKeepExistingImage(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    
    if (selectedFile) {
      formData.set("image", selectedFile);
    }
    formData.set("keepExistingImage", keepExistingImage.toString());

    const result = isEditing
      ? await updateFlavorAction(flavor.id, formData)
      : await createFlavorAction(productId, formData);

    setLoading(false);

    if (result.success) {
      toast.success(isEditing ? "Sabor atualizado!" : "Sabor adicionado!");
      onSuccess();
      onOpenChange(false);
      // Reset state
      setPreview(null);
      setSelectedFile(null);
      setKeepExistingImage(false);
      formRef.current?.reset();
    } else {
      toast.error(result.error ?? "Erro ao salvar sabor.");
    }
  }

  function handleOpenChange(newOpen: boolean) {
    if (!newOpen) {
      // Cleanup on close
      if (preview && preview !== flavor?.imageUrl) {
        URL.revokeObjectURL(preview);
      }
      setPreview(flavor?.imageUrl ?? null);
      setSelectedFile(null);
      setKeepExistingImage(!!flavor?.imageUrl);
    }
    onOpenChange(newOpen);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">
            {isEditing ? "Editar Sabor" : "Novo Sabor"}
          </DialogTitle>
        </DialogHeader>

        <form ref={formRef} onSubmit={handleSubmit} className="space-y-5 mt-2">
          {/* Nome */}
          <div className="space-y-2">
            <Label htmlFor="flavor-name" className="text-muted-foreground">
              Nome do Sabor <span className="text-destructive">*</span>
            </Label>
            <Input
              id="flavor-name"
              name="name"
              required
              defaultValue={flavor?.name ?? ""}
              className="bg-secondary/20 rounded-xl h-11 px-4"
              placeholder="Ex: Chocolate"
            />
          </div>

          {/* Preço */}
          <div className="space-y-2">
            <Label htmlFor="flavor-price" className="text-muted-foreground">
              Preço (R$) <span className="text-destructive">*</span>
            </Label>
            <Input
              id="flavor-price"
              name="price"
              required
              defaultValue={flavor?.price ?? ""}
              className="bg-secondary/20 rounded-xl h-11 px-4"
              placeholder="45,00"
            />
          </div>

          {/* Imagem */}
          <div className="space-y-3">
            <Label className="text-muted-foreground">Imagem do Sabor</Label>

            {preview ? (
              <div className="relative w-24 h-24 rounded-xl overflow-hidden border border-border/60 group">
                <Image
                  src={preview}
                  alt="Preview"
                  fill
                  className="object-cover"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full border-2 border-dashed border-border/60 rounded-xl p-5 flex flex-col items-center justify-center gap-2 hover:border-primary/60 hover:bg-primary/5 transition-all cursor-pointer"
              >
                <ImagePlus className="w-6 h-6 text-muted-foreground/50" />
                <p className="text-xs text-muted-foreground">
                  Clique para adicionar
                </p>
              </button>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              className="flex-1 rounded-xl cursor-pointer"
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-xl cursor-pointer"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              {isEditing ? "Salvar" : "Adicionar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
