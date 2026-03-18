"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { updateProductAction } from "@/actions/product";
import { toast } from "sonner";
import { Loader2, X, ImagePlus, Layers2, Tag, DollarSign, FileText, Grid2x2 } from "lucide-react";

interface ProductToEdit {
  id: string;
  name: string;
  price: string;
  description: string | null;
  category: string | null;
  groupId: string | null;
  variantName: string | null;
  images: string[];
}

interface NewImagePreview {
  url: string;
  name: string;
  file: File;
}

interface EditProductModalProps {
  product: ProductToEdit;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditProductModal({
  product,
  open,
  onOpenChange,
}: EditProductModalProps) {
  const [loading, setLoading] = useState<boolean>(false);
  const [descriptionLength, setDescriptionLength] = useState<number>(
    product.description?.length ?? 0
  );

  // Imagens que JÁ EXISTEM e o usuário mantém
  const [existingImages, setExistingImages] = useState<string[]>(
    product.images
  );

  // Novas imagens selecionadas pelo usuário
  const [newPreviews, setNewPreviews] = useState<NewImagePreview[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    const previews: NewImagePreview[] = files.map((file) => ({
      url: URL.createObjectURL(file),
      name: file.name,
      file,
    }));
    setNewPreviews((prev) => [...prev, ...previews]);
    e.target.value = "";
  }

  function removeExisting(url: string) {
    setExistingImages((prev) => prev.filter((u) => u !== url));
  }

  function removeNew(index: number) {
    setNewPreviews((prev) => {
      const updated = [...prev];
      URL.revokeObjectURL(updated[index].url);
      updated.splice(index, 1);
      return updated;
    });
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const rawForm = new FormData(e.currentTarget);
    const formData = new FormData();

    // Campos de texto
    formData.set("name", rawForm.get("name") as string);
    formData.set("price", rawForm.get("price") as string);
    formData.set("description", (rawForm.get("description") as string) ?? "");
    formData.set("category", (rawForm.get("category") as string) ?? "");
    formData.set("groupId", (rawForm.get("groupId") as string) ?? "");
    formData.set("variantName", (rawForm.get("variantName") as string) ?? "");

    // URLs existentes a MANTER (como JSON)
    formData.set("existingImages", JSON.stringify(existingImages));

    // Novas imagens como arquivo
    for (const preview of newPreviews) {
      formData.append("images", preview.file);
    }

    const result = await updateProductAction(product.id, formData);
    setLoading(false);

    if (result.success) {
      toast.success("Produto atualizado com sucesso!");
      // Limpa previews de novas imagens
      newPreviews.forEach((p) => URL.revokeObjectURL(p.url));
      setNewPreviews([]);
      onOpenChange(false);
    } else {
      toast.error(result.error ?? "Erro ao atualizar produto.");
    }
  }

  const totalImages = existingImages.length + newPreviews.length;
  const MAX_DESCRIPTION = 500;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[92vh] overflow-y-auto rounded-3xl p-0 gap-0">
        {/* Header */}
        <DialogHeader className="px-8 pt-8 pb-5 border-b border-border/50 sticky top-0 bg-background/95 backdrop-blur-sm z-10">
          <DialogTitle className="font-display text-2xl font-bold tracking-tight">
            Editar Produto
          </DialogTitle>
          <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
            Atualize as informações do produto. As alterações serão refletidas
            imediatamente na loja.
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="px-8 py-7 space-y-6">

            {/* Nome + Preço em linha */}
            <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-4 items-end">
              <div className="space-y-2">
                <Label htmlFor="edit-name" className="text-sm font-medium text-foreground/80 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-primary/60" />
                  Nome do Produto <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="edit-name"
                  name="name"
                  required
                  defaultValue={product.name}
                  className="bg-secondary/20 rounded-2xl h-12 px-4 shadow-inner text-base"
                  placeholder="Ex: Cuca de Banana"
                />
              </div>

              <div className="space-y-2 sm:w-40">
                <Label htmlFor="edit-price" className="text-sm font-medium text-foreground/80 flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-primary/60" />
                  Preço (R$) <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="edit-price"
                  name="price"
                  required
                  defaultValue={parseFloat(product.price).toFixed(2).replace(".", ",")}
                  className="bg-secondary/20 rounded-2xl h-12 px-4 shadow-inner text-base font-medium"
                  placeholder="45,00"
                />
              </div>
            </div>

            {/* Descrição — Textarea com contador */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="edit-description" className="text-sm font-medium text-foreground/80">
                  Descrição
                </Label>
                <span className={`text-xs transition-colors ${
                  descriptionLength > MAX_DESCRIPTION * 0.9
                    ? "text-destructive"
                    : "text-muted-foreground/60"
                }`}>
                  {descriptionLength}/{MAX_DESCRIPTION}
                </span>
              </div>
              <div className="relative">
                <Textarea
                  id="edit-description"
                  name="description"
                  defaultValue={product.description ?? ""}
                  maxLength={MAX_DESCRIPTION}
                  onChange={(e) => setDescriptionLength(e.target.value.length)}
                  className="bg-secondary/20 rounded-2xl px-4 py-3.5 shadow-inner text-sm leading-relaxed resize-none min-h-[120px] placeholder:text-muted-foreground/50 focus-visible:ring-primary/30"
                  placeholder="Descreva os ingredientes, o modo de preparo, o tamanho, o sabor... Use quantas linhas precisar para descrever bem o produto."
                />
              </div>
              <p className="text-xs text-muted-foreground/60 leading-relaxed pl-1">
                Uma boa descrição aumenta as chances de encomenda. Fale sobre sabor, textura e diferenciais.
              </p>
            </div>

            {/* Categoria */}
            <div className="space-y-2">
              <Label htmlFor="edit-category" className="text-sm font-medium text-foreground/80 flex items-center gap-1.5">
                <Grid2x2 className="w-3.5 h-3.5 text-primary/60" />
                Categoria
              </Label>
              <Input
                id="edit-category"
                name="category"
                defaultValue={product.category ?? ""}
                className="bg-secondary/20 rounded-2xl h-12 px-4 shadow-inner"
                placeholder="Ex: Cucas, Massas, Pães"
              />
            </div>

            {/* Variantes */}
            <div className="rounded-2xl border border-border/50 bg-secondary/10 p-5 space-y-4">
              <div className="flex items-center gap-2">
                <Layers2 className="w-4 h-4 text-primary/60" />
                <p className="text-sm font-medium text-foreground/80">
                  Variantes
                </p>
                <span className="text-xs text-muted-foreground/60 ml-1">
                  — para agrupar sabores do mesmo produto
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="edit-groupId"
                    className="text-muted-foreground text-xs"
                  >
                    ID do Grupo
                  </Label>
                  <Input
                    id="edit-groupId"
                    name="groupId"
                    defaultValue={product.groupId ?? ""}
                    className="bg-background rounded-xl h-10 px-4 shadow-inner text-sm"
                    placeholder="Ex: cuca-familia"
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="edit-variantName"
                    className="text-muted-foreground text-xs"
                  >
                    Nome do Sabor
                  </Label>
                  <Input
                    id="edit-variantName"
                    name="variantName"
                    defaultValue={product.variantName ?? ""}
                    className="bg-background rounded-xl h-10 px-4 shadow-inner text-sm"
                    placeholder="Ex: Chocolate"
                  />
                </div>
              </div>
            </div>

            {/* Gerenciamento de Imagens */}
            <div className="space-y-4 border-t border-border/40 pt-5">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium text-foreground/80 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-primary/60" />
                  Fotos do Produto
                </Label>
                <span className="text-xs text-muted-foreground bg-secondary/40 px-2.5 py-1 rounded-full font-medium">
                  {totalImages} foto{totalImages !== 1 ? "s" : ""}
                </span>
              </div>

              {/* Grid de imagens existentes + novas */}
              {totalImages > 0 && (
                <div className="flex flex-wrap gap-3">
                  {/* Imagens existentes */}
                  {existingImages.map((url, i) => (
                    <div
                      key={`existing-${i}`}
                      className="relative w-20 h-20 rounded-xl overflow-hidden border border-border/60 group flex-shrink-0 shadow-sm"
                    >
                      <Image
                        src={url}
                        alt={`Foto existente ${i + 1}`}
                        fill
                        className="object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeExisting(url)}
                        className="absolute inset-0 bg-black/55 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                      >
                        <X className="w-4 h-4 text-white drop-shadow" />
                      </button>
                      {i === 0 && (
                        <span className="absolute bottom-0 left-0 right-0 text-[8px] text-center bg-primary/85 text-primary-foreground py-0.5 font-semibold tracking-wide">
                          CAPA
                        </span>
                      )}
                    </div>
                  ))}

                  {/* Novas imagens adicionadas */}
                  {newPreviews.map((preview, i) => (
                    <div
                      key={`new-${i}`}
                      className="relative w-20 h-20 rounded-xl overflow-hidden border-2 border-dashed border-primary/50 group flex-shrink-0 shadow-sm"
                    >
                      <Image
                        src={preview.url}
                        alt={preview.name}
                        fill
                        className="object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeNew(i)}
                        className="absolute inset-0 bg-black/55 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                      >
                        <X className="w-4 h-4 text-white drop-shadow" />
                      </button>
                      {/* Badge "Nova" */}
                      <span className="absolute top-1 right-1 bg-primary text-primary-foreground text-[7px] font-bold px-1.5 py-0.5 rounded-full leading-none shadow">
                        Nova
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Botão de adicionar fotos */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full border-2 border-dashed border-border/60 rounded-2xl p-5 flex items-center justify-center gap-3 hover:border-primary/60 hover:bg-primary/5 transition-all cursor-pointer group"
              >
                <ImagePlus className="w-5 h-5 text-muted-foreground/50 group-hover:text-primary/60 transition-colors" />
                <p className="text-sm text-muted-foreground group-hover:text-foreground/70 transition-colors">
                  Adicionar mais fotos
                </p>
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          </div>

          <DialogFooter className="px-8 py-5 border-t border-border/50 flex flex-row gap-3 sticky bottom-0 bg-background/95 backdrop-blur-sm">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
              className="rounded-full flex-1 h-12 cursor-pointer text-sm font-medium"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="rounded-full flex-1 h-12 font-bold cursor-pointer hover:scale-[1.02] transition-transform shadow-md text-sm"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Salvando...
                </>
              ) : (
                "Salvar Alterações"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
