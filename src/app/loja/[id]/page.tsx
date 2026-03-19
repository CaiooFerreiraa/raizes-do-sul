import { prisma } from "@/infrastructure/database/prisma";
import { notFound } from "next/navigation";
import { Header } from "@/components/header";
import { ProductDetailClient } from "./product-detail-client";
import type { Flavor } from "@prisma/client";

interface ProductDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { id } = await params;

  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      flavors: {
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!product) notFound();

  const serializedProduct = {
    id: product.id,
    name: product.name,
    description: product.description,
    price: product.price.toString(),
    imageUrl: product.imageUrl,
    images: product.images,
    category: product.category,
    isAvailable: product.isAvailable,
  };

  const serializedFlavors = product.flavors.map((f: Flavor) => ({
    id: f.id,
    name: f.name,
    price: f.price.toString(),
    imageUrl: f.imageUrl,
    isAvailable: f.isAvailable,
  }));

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1">
        <ProductDetailClient product={serializedProduct} flavors={serializedFlavors} />
      </main>
      <footer className="border-t border-border/50 py-8 bg-secondary/10">
        <div className="container px-4 md:px-6 mx-auto text-center">
          <p className="text-muted-foreground text-sm">
            © 2026 Raízes do Sul • Feito com amor e tradição.
          </p>
        </div>
      </footer>
    </div>
  );
}
