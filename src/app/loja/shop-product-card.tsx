"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ShoppingBag, Star, ImageOff } from "lucide-react";

interface Product {
  id: string;
  name: string;
  price: string;
  description: string | null;
  imageUrl: string | null;
  images: string[];
  variantName: string | null;
  category: string | null;
}

interface ShopProductCardProps {
  product: Product;
}

export function ShopProductCard({ product }: ShopProductCardProps) {
  const [imgError, setImgError] = useState(false);

  // Pega a thumbnail: primeira de images[], se não houver usa imageUrl
  const thumbnailSrc =
    product.images && product.images.length > 0
      ? product.images[0]
      : product.imageUrl ?? null;

  const formattedPrice = parseFloat(product.price).toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
  });

  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="group"
    >
      <Link href={`/loja/${product.id}`} className="flex flex-col h-full">
        <div className="relative flex flex-col bg-card border border-border/50 rounded-xl md:rounded-2xl overflow-hidden hover:shadow-lg hover:border-primary/20 transition-all duration-300 h-full cursor-pointer">
          {/* Imagem */}
          <div className="relative aspect-square bg-secondary/30 overflow-hidden">
            {thumbnailSrc && !imgError ? (
              <Image
                src={thumbnailSrc}
                alt={product.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
                onError={() => setImgError(true)}
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 opacity-20">
                <ImageOff className="w-8 h-8" />
              </div>
            )}

            {/* Overlay hover */}
            <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/5 transition-colors duration-300" />

            {/* Badge de galeria */}
            {product.images && product.images.length > 1 && (
              <div className="absolute top-2 right-2 bg-black/40 backdrop-blur-sm text-white text-[10px] font-medium px-2 py-0.5 rounded-full">
                +{product.images.length}
              </div>
            )}
          </div>

          {/* Conteúdo */}
          <div className="flex flex-col flex-1 p-2.5 md:p-3 gap-1.5">
            {/* Categoria */}
            {product.category && (
              <span className="text-[9px] md:text-[10px] font-semibold uppercase tracking-widest text-primary/70">
                {product.category}
              </span>
            )}

            {/* Nome */}
            <h3 className="font-display text-sm md:text-base font-bold text-foreground line-clamp-2 leading-snug">
              {product.name}
            </h3>

            {/* Variante */}
            {product.variantName && (
              <span className="text-[10px] text-muted-foreground bg-secondary/40 px-2 py-0.5 rounded-full w-fit">
                {product.variantName}
              </span>
            )}

            {/* Estrelas */}
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className="w-2.5 h-2.5 fill-amber-400 text-amber-400"
                />
              ))}
              <span className="text-[10px] text-muted-foreground ml-1">(5.0)</span>
            </div>

            {/* Preço + CTA */}
            <div className="mt-auto pt-2 flex items-center justify-between gap-1">
              <p className="text-primary font-bold text-sm md:text-base leading-none">
                R$ {formattedPrice}
              </p>
              <div className="w-7 h-7 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300 flex-shrink-0">
                <ShoppingBag className="w-3.5 h-3.5 text-primary group-hover:text-primary-foreground transition-colors" />
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
