"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createProductAction } from "@/actions/product";
import { toast } from "sonner";
import { Loader2, X, ImagePlus } from "lucide-react";
import Image from "next/image";

interface ImagePreview {
  url: string;
  name: string;
  file: File;
}

export function ProductForm() {
  const [loading, setLoading] = useState(false);
  const [previews, setPreviews] = useState<ImagePreview[]>([]);
  const [descriptionLength, setDescriptionLength] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    const newPreviews = files.map((file) => ({
      url: URL.createObjectURL(file),
      name: file.name,
      file,
    }));
    setPreviews((prev) => [...prev, ...newPreviews]);
    // Limpa o input para permitir re-seleção dos mesmos arquivos
    e.target.value = "";
  }

  function removePreview(index: number) {
    setPreviews((prev) => {
      const updated = [...prev];
      URL.revokeObjectURL(updated[index].url);
      updated.splice(index, 1);
      return updated;
    });
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);

    const formData = new FormData(event.currentTarget);

    // Remove o campo legado "image" e adiciona as imagens selecionadas como "images"
    formData.delete("images");
    for (const preview of previews) {
      formData.append("images", preview.file);
    }

    const result = await createProductAction(formData);

    setLoading(false);

    if (result.success) {
      toast.success("Produto adicionado com sucesso!");
      formRef.current?.reset();
      // Limpa previews
      previews.forEach((p) => URL.revokeObjectURL(p.url));
      setPreviews([]);
    } else {
      toast.error(result.error ?? "Erro ao adicionar produto.");
    }
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-5">
      {/* Nome */}
      <div className="space-y-2">
        <Label htmlFor="name" className="text-muted-foreground ml-1">
          Nome do Produto <span className="text-destructive">*</span>
        </Label>
        <Input
          id="name"
          name="name"
          required
          className="bg-secondary/20 rounded-2xl h-12 px-4 shadow-inner"
          placeholder="Ex: Cuca de Banana"
        />
      </div>

      {/* Preço */}
      <div className="space-y-2">
        <Label htmlFor="price" className="text-muted-foreground ml-1">
          Preço (R$) <span className="text-destructive">*</span>
        </Label>
        <Input
          id="price"
          name="price"
          required
          className="bg-secondary/20 rounded-2xl h-12 px-4 shadow-inner"
          placeholder="45,00"
        />
      </div>

      {/* Descrição */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="description" className="text-muted-foreground ml-1">
            Descrição
          </Label>
          <span className={`text-xs transition-colors ${
            descriptionLength > 900
              ? "text-destructive"
              : "text-muted-foreground/50"
          }`}>
            {descriptionLength}/1000
          </span>
        </div>
        <Textarea
          id="description"
          name="description"
          maxLength={1000}
          onChange={(e) => setDescriptionLength(e.target.value.length)}
          className="bg-secondary/20 rounded-2xl px-4 py-3.5 shadow-inner text-sm leading-relaxed resize-none min-h-[110px] placeholder:text-muted-foreground/50 focus-visible:ring-primary/30"
          placeholder="Ingredientes, modo de preparo, tamanho, sabor... Descreva bem o produto!"
        />
        <p className="text-xs text-muted-foreground/50 leading-relaxed pl-1">
          Uma boa descrição aumenta as chances de encomenda.
        </p>
      </div>

      {/* Categoria */}
      <div className="space-y-2">
        <Label htmlFor="category" className="text-muted-foreground ml-1">
          Categoria
        </Label>
        <Input
          id="category"
          name="category"
          className="bg-secondary/20 rounded-2xl h-12 px-4 shadow-inner"
          placeholder="Ex: Cucas, Massas, Pães"
        />
      </div>

      {/* Nota sobre sabores */}
      <div className="pt-1 pb-1 border-t border-border/40">
        <p className="text-xs text-muted-foreground/70 mt-2">
          💡 Após criar o produto, você poderá adicionar sabores com preços e imagens diferentes.
        </p>
      </div>

      {/* Upload de múltiplas imagens */}
      <div className="space-y-3">
        <Label className="text-muted-foreground ml-1">
          Fotos do Produto (Máx 10MB cada)
        </Label>

        {/* Área de drag/drop visual */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="w-full border-2 border-dashed border-border/60 rounded-2xl p-6 flex flex-col items-center justify-center gap-2 hover:border-primary/60 hover:bg-primary/5 transition-all cursor-pointer"
        >
          <ImagePlus className="w-8 h-8 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground text-center">
            Clique para adicionar fotos
          </p>
          <p className="text-xs text-muted-foreground/50">
            PNG, JPG, WEBP — até 10MB cada
          </p>
        </button>

        {/* Input oculto */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileChange}
          className="hidden"
        />

        {/* Previews das imagens */}
        {previews.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            {previews.map((preview, i) => (
              <div
                key={i}
                className="relative w-16 h-16 rounded-xl overflow-hidden border border-border/60 group"
              >
                <Image
                  src={preview.url}
                  alt={preview.name}
                  fill
                  className="object-cover"
                />
                <button
                  type="button"
                  onClick={() => removePreview(i)}
                  className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
                {i === 0 && (
                  <span className="absolute bottom-0 left-0 right-0 text-[8px] text-center bg-primary/80 text-primary-foreground py-0.5">
                    Capa
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <Button
        type="submit"
        disabled={loading}
        className="w-full h-12 rounded-full cursor-pointer mt-2 font-bold text-md hover:scale-[1.02] transition-transform"
      >
        {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
        {loading ? "Adicionando..." : "Adicionar Produto"}
      </Button>
    </form>
  );
}
