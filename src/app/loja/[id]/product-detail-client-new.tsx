"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  ShoppingBag,
  ArrowLeft,
  Share2,
  Star,
  Check,
  ImageOff,
} from "lucide-react";

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: string;
  imageUrl: string | null;
  images: string[];
  category: string | null;
  isAvailable: boolean;
}

interface Flavor {
  id: string;
  name: string;
  price: string;
  imageUrl: string | null;
  isAvailable: boolean;
}

interface ProductDetailClientProps {
  product: Product;
  flavors: Flavor[];
}

export function ProductDetailClient({ product, flavors }: ProductDetailClientProps) {
  const router = useRouter();

  // Montar galeria: images[] primeiro, depois imageUrl como fallback
  const galleryImages: string[] = [
    ...(product.images ?? []),
    ...(product.imageUrl && !product.images.includes(product.imageUrl)
      ? [product.imageUrl]
      : []),
  ];

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedFlavorId, setSelectedFlavorId] = useState<string | null>(
    flavors.length > 0 ? flavors[0].id : null
  );
  const [copied, setCopied] = useState(false);

  const selectedFlavor = flavors.find((f) => f.id === selectedFlavorId) ?? null;
  
  // Se tem sabores, usa o preço do sabor selecionado; senão, usa o preço base
  const displayPrice = selectedFlavor ? selectedFlavor.price : product.price;
  
  // Se tem sabores e um está selecionado, usa a imagem do sabor (se tiver)
  const flavorImage = selectedFlavor?.imageUrl;

  function prevImage() {
    setActiveImageIndex((prev) =>
      prev === 0 ? galleryImages.length - 1 : prev - 1
    );
  }

  function nextImage() {
    setActiveImageIndex((prev) =>
      prev === galleryImages.length - 1 ? 0 : prev + 1
    );
  }

  async function handleShare() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  }

  const hasMultipleImages = galleryImages.length > 1;
  const hasFlavors = flavors.length > 0;
  
  // Se produto tem sabores, precisa selecionar um para encomendar
  const canOrder = product.isAvailable && (!hasFlavors || (selectedFlavor && selectedFlavor.isAvailable));
  
  // Query params para encomenda
  const orderParams = new URLSearchParams();
  orderParams.set("productId", product.id);
  if (selectedFlavorId) {
    orderParams.set("flavorId", selectedFlavorId);
  }

  return (
    <div className="container mx-auto px-4 md:px-6 py-6 md:py-10 max-w-6xl">
      {/* Breadcrumb / Back */}
      <div className="flex items-center gap-2 mb-6 text-sm text-muted-foreground">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 hover:text-foreground transition-colors cursor-pointer group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          <span>Voltar</span>
        </button>
        <span className="opacity-40">/</span>
        <Link href="/loja" className="hover:text-foreground transition-colors">
          Loja
        </Link>
        <span className="opacity-40">/</span>
        <span className="text-foreground font-medium truncate max-w-[200px]">
          {product.name}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-14">
        {/* ─── Galeria ─── */}
        <div className="flex flex-col gap-3">
          {/* Imagem principal */}
          <div className="relative aspect-square rounded-2xl md:rounded-3xl overflow-hidden bg-secondary/30 border border-border/50 shadow-sm">
            <AnimatePresence mode="wait">
              {galleryImages.length > 0 ? (
                <motion.div
                  key={activeImageIndex}
                  initial={{ opacity: 0, scale: 1.03 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={{ duration: 0.25 }}
                  className="absolute inset-0"
                >
                  <Image
                    src={galleryImages[activeImageIndex]}
                    alt={product.name}
                    fill
                    className="object-cover"
                    priority
                  />
                </motion.div>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 opacity-30">
                  <ImageOff className="w-12 h-12" />
                  <span className="text-sm">Sem imagem</span>
                </div>
              )}
            </AnimatePresence>

            {/* Setas de navegação */}
            {hasMultipleImages && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 backdrop-blur-sm shadow-md flex items-center justify-center hover:bg-white transition-all cursor-pointer z-10"
                >
                  <ChevronLeft className="w-5 h-5 text-foreground" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 backdrop-blur-sm shadow-md flex items-center justify-center hover:bg-white transition-all cursor-pointer z-10"
                >
                  <ChevronRight className="w-5 h-5 text-foreground" />
                </button>
              </>
            )}

            {/* Indicador de imagem */}
            {hasMultipleImages && (
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                {galleryImages.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImageIndex(i)}
                    className={`rounded-full transition-all cursor-pointer ${
                      i === activeImageIndex
                        ? "w-5 h-2 bg-primary"
                        : "w-2 h-2 bg-white/70"
                    }`}
                  />
                ))}
              </div>
            )}

            {/* Badge disponibilidade */}
            {!product.isAvailable && (
              <div className="absolute top-3 left-3 bg-destructive text-destructive-foreground text-xs font-bold px-3 py-1 rounded-full z-10">
                Indisponível
              </div>
            )}
          </div>

          {/* Thumbnails */}
          {hasMultipleImages && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {galleryImages.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImageIndex(i)}
                  className={`relative flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                    i === activeImageIndex
                      ? "border-primary shadow-md"
                      : "border-border/50 opacity-60 hover:opacity-90"
                  }`}
                >
                  <Image
                    src={img}
                    alt={`Foto ${i + 1}`}
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ─── Info do Produto ─── */}
        <div className="flex flex-col gap-6">
          {/* Cabeçalho */}
          <div className="space-y-2">
            {product.category && (
              <span className="inline-block text-xs font-semibold uppercase tracking-widest text-primary/70 bg-primary/10 px-3 py-1 rounded-full">
                {product.category}
              </span>
            )}
            <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground leading-tight">
              {product.name}
            </h1>

            {/* Avaliação fake / estrelas (visual) */}
            <div className="flex items-center gap-1.5 pt-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className={`w-4 h-4 ${
                    s <= 5
                      ? "fill-amber-400 text-amber-400"
                      : "text-border"
                  }`}
                />
              ))}
              <span className="text-xs text-muted-foreground ml-1">
                Artesanal & Feito com Amor
              </span>
            </div>
          </div>

          {/* Preço */}
          <div className="bg-secondary/20 rounded-2xl px-5 py-4 border border-border/30">
            <p className="text-xs text-muted-foreground mb-1">Preço</p>
            <div className="flex items-end gap-2">
              <span className="font-display text-4xl font-bold text-primary">
                R${" "}
                {parseFloat(displayPrice).toLocaleString("pt-BR", {
                  minimumFractionDigits: 2,
                })}
              </span>
              <span className="text-xs text-muted-foreground mb-1">/ unidade</span>
            </div>
          </div>

          {/* ─── Seletor de Sabores (Estilo Shopee) ─── */}
          {hasFlavors && (
            <div className="space-y-3">
              <p className="text-sm font-semibold text-foreground">
                Escolha o Sabor
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {flavors.map((flavor) => {
                  const isSelected = flavor.id === selectedFlavorId;
                  const isUnavailable = !flavor.isAvailable;
                  
                  return (
                    <button
                      key={flavor.id}
                      onClick={() => !isUnavailable && setSelectedFlavorId(flavor.id)}
                      disabled={isUnavailable}
                      className={`relative flex items-center gap-3 p-3 rounded-xl border-2 transition-all cursor-pointer text-left ${
                        isSelected
                          ? "border-primary bg-primary/5 shadow-sm"
                          : "border-border/60 hover:border-primary/50 bg-card"
                      } ${isUnavailable ? "opacity-50 cursor-not-allowed" : "hover:scale-[1.02]"}`}
                    >
                      {/* Imagem do sabor */}
                      {flavor.imageUrl ? (
                        <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-secondary/30 flex-shrink-0">
                          <Image
                            src={flavor.imageUrl}
                            alt={flavor.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-secondary/30 flex items-center justify-center flex-shrink-0">
                          <span className="text-lg">🍰</span>
                        </div>
                      )}
                      
                      {/* Info do sabor */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {flavor.name}
                        </p>
                        <p className="text-xs text-primary font-semibold">
                          R$ {parseFloat(flavor.price).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                      
                      {/* Check de selecionado */}
                      {isSelected && (
                        <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                          <Check className="w-3 h-3 text-primary-foreground" />
                        </div>
                      )}
                      
                      {/* Badge indisponível */}
                      {isUnavailable && (
                        <div className="absolute inset-0 bg-background/60 rounded-xl flex items-center justify-center">
                          <span className="text-xs font-medium text-muted-foreground bg-background/90 px-2 py-0.5 rounded">
                            Esgotado
                          </span>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
              
              {/* Aviso se nenhum sabor selecionado */}
              {!selectedFlavorId && (
                <p className="text-xs text-amber-600 bg-amber-50 dark:bg-amber-950/30 px-3 py-2 rounded-lg">
                  ⚠️ Selecione um sabor para continuar
                </p>
              )}
            </div>
          )}

          {/* Descrição */}
          {product.description && (
            <div className="space-y-1.5">
              <p className="text-sm font-semibold text-foreground">Sobre este Produto</p>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {product.description}
              </p>
            </div>
          )}

          {/* Badges de qualidade */}
          <div className="flex flex-wrap gap-2">
            {["Artesanal", "Sem conservantes", "Feito na hora"].map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 text-xs text-primary bg-primary/10 px-3 py-1 rounded-full font-medium"
              >
                <Check className="w-3 h-3" />
                {tag}
              </span>
            ))}
          </div>

          {/* CTAs */}
          <div className="flex flex-col gap-3 pt-2">
            <Link
              href={canOrder ? `/encomenda?${orderParams.toString()}` : "#"}
              className="w-full"
              onClick={(e) => !canOrder && e.preventDefault()}
            >
              <Button
                size="lg"
                disabled={!canOrder}
                className="w-full h-14 rounded-2xl text-base font-bold cursor-pointer hover:scale-[1.02] transition-transform shadow-md disabled:cursor-not-allowed"
              >
                <ShoppingBag className="w-5 h-5 mr-2" />
                {!product.isAvailable 
                  ? "Indisponível" 
                  : hasFlavors && !selectedFlavorId 
                    ? "Selecione um Sabor"
                    : selectedFlavor && !selectedFlavor.isAvailable
                      ? "Sabor Esgotado"
                      : "Encomendar Agora"
                }
              </Button>
            </Link>

            <button
              onClick={handleShare}
              className="w-full h-11 rounded-2xl border border-border/70 bg-background hover:bg-secondary/20 transition-all flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-primary" />
                  <span>Link copiado!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4" />
                  <span>Compartilhar</span>
                </>
              )}
            </button>
          </div>

          {/* Nota de encomenda */}
          <p className="text-xs text-muted-foreground/70 text-center">
            As encomendas são confirmadas via WhatsApp ou e-mail após o envio.
          </p>
        </div>
      </div>
    </div>
  );
}
