import { prisma } from '../src/infrastructure/database/prisma';

const API_URL = "https://api.abacatepay.com/v2";
const API_KEY = process.env.ABACATEPAY_API;

async function fetchAbacate<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${API_KEY}`,
      ...options.headers,
    },
  });

  const resData = await response.json();

  if (!response.ok) {
    throw new Error(resData.error || `Failed to call AbacatePay ${endpoint}`);
  }

  return resData.data;
}

async function getOrCreateProduct(p: { externalId: string; name: string; price: number; imageUrl?: string }) {
  try {
    const product: any = await fetchAbacate(`/products/get?externalId=${p.externalId}`);
    if (product && product.id) {
       console.log(`✅ Produto já existe na AbacatePay: ${p.name}`);
       return product;
    }
  } catch (e) {
    // Produto não encontrado, continua para criação.
  }
  
  console.log(`⏳ Criando produto na AbacatePay: ${p.name}`);
  return await fetchAbacate("/products/create", {
    method: "POST",
    body: JSON.stringify({
      externalId: p.externalId,
      name: p.name,
      price: p.price,
      image: p.imageUrl || null,
      currency: "BRL",
      description: `Produto ${p.name}`,
    }),
  });
}

async function run() {
  if (!API_KEY) {
      console.error("ABACATEPAY_API não encontrada no .env");
      process.exit(1);
  }

  console.log("Iniciando sincronização de produtos com AbacatePay V2...\n");

  const products = await prisma.product.findMany({
    include: { flavors: true }
  });

  for (const product of products) {
    if (product.flavors.length === 0) {
      await getOrCreateProduct({
        externalId: `v2-${product.id}`,
        name: product.name,
        price: Math.round(Number(product.price) * 100), // preço em centavos
        imageUrl: product.imageUrl || (product.images && product.images.length > 0 ? product.images[0] : undefined)
      });
    } else {
      for (const flavor of product.flavors) {
        await getOrCreateProduct({
          externalId: `v2-${product.id}-${flavor.id}`,
          name: `${product.name} - ${flavor.name}`,
          price: Math.round(Number(flavor.price) * 100), // preço em centavos
          imageUrl: flavor.imageUrl || product.imageUrl || (product.images && product.images.length > 0 ? product.images[0] : undefined)
        });
      }
    }
  }
  console.log("\nSincronização concluída com sucesso!");
}

run().catch(console.error).finally(() => prisma.$disconnect());
