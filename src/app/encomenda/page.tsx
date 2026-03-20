import { prisma } from "@/infrastructure/database/prisma";
import OrderForm from "./order-form";

type ProductDTO = {
  id: string;
  name: string;
  description: string | null;
  price: string;
  imageUrl: string | null;
  flavors: string[];
};

export const metadata = {
  title: "Fazer Encomenda | Raízes do Sul",
  description: "Faça sua encomenda de massas e doces artesanais",
};

export const revalidate = 60; // Revalidate at most every 60 seconds

interface EncomendaPageProps {
  searchParams: Promise<{ productId?: string; flavor?: string }>;
}

import type { Product } from "@prisma/client";

export default async function EncomendaPage({ searchParams }: EncomendaPageProps) {
  const { productId, flavor } = await searchParams;
  
  const dbProducts = await prisma.product.findMany({
    where: { isAvailable: true },
    orderBy: { name: "asc" },
  });

  const products: ProductDTO[] = dbProducts.map((p: Product) => ({
    id: p.id,
    name: p.name,
    description: p.description,
    price: p.price.toString(),
    imageUrl: p.imageUrl,
    flavors: p.flavors,
  }));

  return (
    <div className="flex flex-col min-h-screen bg-background w-full">
      <main className="flex-1 w-full flex flex-col">
        <OrderForm 
          initialProducts={JSON.parse(JSON.stringify(products)) as ProductDTO[]} 
          preselectedProductId={productId}
          preselectedFlavor={flavor}
        />
      </main>
    </div>
  );
}
