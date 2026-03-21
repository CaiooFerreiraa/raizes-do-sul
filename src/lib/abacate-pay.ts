
const API_URL = "https://api.abacatepay.com/v2";
const API_KEY = process.env.ABACATEPAY_API;

interface CreateCheckoutInput {
  externalId: string;
  customer: {
    name: string;
    email: string;
    cellphone: string;
  };
  products: Array<{
    externalId: string;
    name: string;
    quantity: number;
    price: number; // in cents
    imageUrl?: string;
  }>;
  returnUrl: string;
  completionUrl: string;
}

async function fetchAbacate<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  if (!API_KEY) {
    throw new Error("ABACATEPAY_API is not defined in .env");
  }

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
    console.error(`AbacatePay Error (${endpoint}):`, resData);
    throw new Error(resData.error || `Failed to call AbacatePay ${endpoint}`);
  }

  return resData.data;
}

async function getOrCreateCustomer(data: { name: string; email: string; cellphone: string }) {
  try {
    // Tenta listar clientes e filtrar pelo email (ou usar um endpoint de busca se disponível)
    // Na V2, podemos tentar buscar pelo email ou externalId se a API permitir.
    // Como a busca exata por email é comum, vamos tentar listar e filtrar.
    const customers: any = await fetchAbacate("/customers/list");
    const existing = customers.find((c: any) => c.email === data.email);
    if (existing) return existing;
  } catch (e) {
    console.error("Erro ao buscar cliente existente:", e);
  }

  return await fetchAbacate("/customers/create", {
    method: "POST",
    body: JSON.stringify({
      name: data.name,
      email: data.email,
      cellphone: data.cellphone.replace(/\D/g, ""),
    }),
  });
}

export async function getOrCreateProduct(p: { externalId: string; name: string; price: number; imageUrl?: string }) {
  try {
    // A V2 suporta GET /v2/products/get?externalId=...
    const product: any = await fetchAbacate(`/products/get?externalId=${p.externalId}`);
    if (product && product.id) return product;
  } catch (e) {
    // Se não encontrar (404), prossegue para criação
  }

  return await fetchAbacate("/products/create", {
    method: "POST",
    body: JSON.stringify({
      externalId: p.externalId,
      name: p.name,
      price: p.price,
      image: p.imageUrl,
      currency: "BRL",
      description: `Produto ${p.name}`,
    }),
  });
}

export async function createAbacatePayCheckout(data: CreateCheckoutInput) {
  // 1. Get or Create Customer
  const customer: any = await getOrCreateCustomer(data.customer);

  // 2. Get or Create Products
  const productPromises = data.products.map(async (p) => {
    const apProduct: any = await getOrCreateProduct(p);
    return { id: apProduct.id, quantity: p.quantity };
  });

  const items = await Promise.all(productPromises);

  // 3. Create the checkout
  const checkout: any = await fetchAbacate("/checkouts/create", {
    method: "POST",
    body: JSON.stringify({
      items,
      customerId: customer.id,
      externalId: data.externalId,
      returnUrl: data.returnUrl,
      completionUrl: data.completionUrl,
      methods: ["CARD"],
    }),
  });

  return { url: checkout.url };
}
