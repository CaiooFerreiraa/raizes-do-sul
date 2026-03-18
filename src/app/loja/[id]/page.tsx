import { prisma } from "@/infrastructure/database/prisma";
import { notFound } from "next/navigation";
import { Header } from "@/components/header";
import { ProductDetailClient } from "./product-detail-client";

interface ProductDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { id } = await params;

  const product = await prisma.product.findUnique({
    where: { id },
  });

  if (!product) notFound();

  // Busca variantes do mesmo grupo (se houver groupId)
  let variants: Array<{
    id: string;
    name: string;
    variantName: string | null;
    price: string;
    imageUrl: string | null;
    isAvailable: boolean;
  }> = [];

  if (product.groupId) {
    const raw = await prisma.product.findMany({
      where: { groupId: product.groupId, isAvailable: true },
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        variantName: true,
        price: true,
        imageUrl: true,
        isAvailable: true,
      },
    });
    variants = raw.map((v: { id: string; name: string; variantName: string | null; price: { toString(): string }; imageUrl: string | null; isAvailable: boolean }) => ({
      ...v,
      price: v.price.toString(),
    }));
  }

  const serializedProduct = {
    id: product.id,
    name: product.name,
    description: product.description,
    price: product.price.toString(),
    imageUrl: product.imageUrl,
    images: product.images,
    category: product.category,
    isAvailable: product.isAvailable,
    groupId: product.groupId,
    variantName: product.variantName,
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1">
        <ProductDetailClient product={serializedProduct} variants={variants} />
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
