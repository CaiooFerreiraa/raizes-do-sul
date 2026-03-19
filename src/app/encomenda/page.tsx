import { prisma } from "@/infrastructure/database/prisma";
import OrderForm from "./order-form";
import type { Product, Flavor } from "@prisma/client";

type FlavorDTO = {
  id: string;
  name: string;
  price: string;
  imageUrl: string | null;
  isAvailable: boolean;
};

type ProductDTO = {
  id: string;
  name: string;
  description: string | null;
  price: string;
  imageUrl: string | null;
  flavors: FlavorDTO[];
};

type ProductWithFlavors = Product & { flavors: Flavor[] };

export const metadata = {
  title: "Fazer Encomenda | Raízes do Sul",
  description: "Faça sua encomenda de massas e doces artesanais",
};

export const revalidate = 60; // Revalidate at most every 60 seconds

export default async function EncomendaPage() {
  const dbProducts = await prisma.product.findMany({
    where: { isAvailable: true },
    orderBy: { name: "asc" },
    include: {
      flavors: {
        where: { isAvailable: true },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  const products: ProductDTO[] = dbProducts.map((p: ProductWithFlavors) => ({
    id: p.id,
    name: p.name,
    description: p.description,
    price: p.price.toString(),
    imageUrl: p.imageUrl,
    flavors: p.flavors.map((f: Flavor) => ({
      id: f.id,
      name: f.name,
      price: f.price.toString(),
      imageUrl: f.imageUrl,
      isAvailable: f.isAvailable,
    })),
  }));

  return (
    <div className="flex flex-col min-h-screen bg-background w-full">
      <main className="flex-1 w-full flex flex-col">
        <OrderForm initialProducts={JSON.parse(JSON.stringify(products))} />
      </main>
    </div>
  );
}
