import { prisma } from "@/infrastructure/database/prisma";
import OrderForm from "./order-form";

type ProductDTO = {
  id: string;
  name: string;
  description: string | null;
  price: string;
  imageUrl: string | null;
};

export const metadata = {
  title: "Fazer Encomenda | Raízes do Sul",
  description: "Faça sua encomenda de massas e doces artesanais",
};

export const revalidate = 60; // Revalidate at most every 60 seconds

const MOCK_PRODUCTS: ProductDTO[] = [
  { id: "1", name: "Bolo de Cenoura", price: "35.00", description: "Com calda de chocolate belga.", imageUrl: null },
  { id: "2", name: "Pão de Campanha", price: "22.00", description: "Fermentação natural 24h.", imageUrl: null },
  { id: "3", name: "Focaccia de Alecrim", price: "18.00", description: "Azeite extravirgem e flor de sal.", imageUrl: null },
  { id: "4", name: "Pasta Fresca (500g)", price: "25.00", description: "Feita com ovos caipiras.", imageUrl: null },
  { id: "5", name: "Bolo de Milho", price: "30.00", description: "Receita tradicional da vovó.", imageUrl: null },
  { id: "6", name: "Pão de Milho", price: "15.00", description: "Macio e quentinho.", imageUrl: null },
  { id: "7", name: "Torta de Maçã", price: "45.00", description: "Com canela e crosta crocante.", imageUrl: null },
  { id: "8", name: "Gnocchi de Batata", price: "28.00", description: "Massa leve e artesanal.", imageUrl: null },
];

export default async function EncomendaPage() {
  const dbProducts = await prisma.product.findMany({
    where: { isAvailable: true },
    orderBy: { name: "asc" },
  });

  const products: ProductDTO[] = dbProducts.length > 0
    ? dbProducts.map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      price: p.price.toString(),
      imageUrl: p.imageUrl,
    }))
    : MOCK_PRODUCTS;

  return (
    <div className="flex flex-col min-h-screen bg-secondary/10">
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 md:p-8">
        <div className="mb-8 p-4 text-center">
          <h1 className="font-display text-3xl md:text-5xl font-bold tracking-tight text-foreground mb-4">
            Faça sua Encomenda
          </h1>
          <p className="text-muted-foreground md:text-lg">
            Selecione os produtos desejados e preencha seus dados. Entraremos em contato com você para confirmar os detalhes e previsão de entrega.
          </p>
        </div>

        <section className="bg-background rounded-3xl shadow-sm border border-border p-6 md:p-10">
          <OrderForm initialProducts={JSON.parse(JSON.stringify(products))} />
        </section>
      </main>
    </div>
  );
}
