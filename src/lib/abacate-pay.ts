
const API_URL = "https://api.abacatepay.com/v2";
const API_KEY = process.env.ABACATEPAY_API;
const EXPECTED_DEV_MODE = process.env.ABACATEPAY_ENVIRONMENT !== "production";

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

interface AbacatePayResponse<T> {
  data: T | null;
  error: string | null;
  success: boolean;
}

interface AbacatePayCustomer {
  id: string;
  email: string;
}

interface AbacatePayProduct {
  id: string;
  externalId: string;
}

interface AbacatePayCheckout {
  url: string;
  devMode: boolean;
}

class AbacatePayApiError extends Error {
  constructor(
    message: string,
    readonly status: number
  ) {
    super(message);
    this.name = "AbacatePayApiError";
  }
}

function getAbacatePayError(error: unknown, fallback: string) {
  if (typeof error === "string" && error.trim()) {
    return error;
  }

  if (error && typeof error === "object" && "message" in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === "string" && message.trim()) {
      return message;
    }
  }

  return fallback;
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

  const resData = (await response.json().catch(() => ({
    data: null,
    error: "Resposta inválida da AbacatePay.",
    success: false,
  }))) as AbacatePayResponse<T>;

  if (!response.ok || !resData.success || resData.data === null) {
    const errorMessage = getAbacatePayError(
      resData.error,
      `Falha ao chamar a AbacatePay (${response.status}).`
    );
    console.error(`AbacatePay Error (${endpoint}):`, {
      status: response.status,
      error: errorMessage,
    });
    throw new AbacatePayApiError(errorMessage, response.status);
  }

  return resData.data;
}

async function getOrCreateCustomer(data: { name: string; email: string; cellphone: string }) {
  const customers = await fetchAbacate<AbacatePayCustomer[]>(
    `/customers/list?email=${encodeURIComponent(data.email)}&limit=1`
  );
  const existing = customers.find((customer) => customer.email === data.email);
  if (existing) return existing;

  const cellphone = data.cellphone.replace(/\D/g, "");

  return fetchAbacate<AbacatePayCustomer>("/customers/create", {
    method: "POST",
    body: JSON.stringify({
      name: data.name,
      email: data.email,
      ...(cellphone.length >= 10 ? { cellphone } : {}),
    }),
  });
}

export async function getOrCreateProduct(p: { externalId: string; name: string; price: number; imageUrl?: string }) {
  try {
    const product = await fetchAbacate<AbacatePayProduct>(
      `/products/get?externalId=${encodeURIComponent(p.externalId)}`
    );
    if (product && product.id) return product;
  } catch (error) {
    if (!(error instanceof AbacatePayApiError) || error.status !== 404) {
      throw error;
    }
  }

  return fetchAbacate<AbacatePayProduct>("/products/create", {
    method: "POST",
    body: JSON.stringify({
      externalId: p.externalId,
      name: p.name,
      price: p.price,
      imageUrl: p.imageUrl,
      currency: "BRL",
      description: `Produto ${p.name}`,
    }),
  });
}

export async function createAbacatePayCheckout(data: CreateCheckoutInput) {
  const customer = await getOrCreateCustomer(data.customer);

  const productPromises = data.products.map(async (p) => {
    const apProduct = await getOrCreateProduct(p);
    return { id: apProduct.id, quantity: p.quantity };
  });

  const items = await Promise.all(productPromises);

  const checkout = await fetchAbacate<AbacatePayCheckout>("/checkouts/create", {
    method: "POST",
    body: JSON.stringify({
      items,
      customerId: customer.id,
      externalId: data.externalId,
      returnUrl: data.returnUrl,
      completionUrl: data.completionUrl,
      methods: ["CARD"],
      metadata: {
        orderId: data.externalId,
        source: "raizes-do-sul",
      },
    }),
  });

  if (checkout.devMode !== EXPECTED_DEV_MODE) {
    throw new Error(
      EXPECTED_DEV_MODE
        ? "A chave configurada não pertence ao ambiente sandbox da AbacatePay."
        : "A chave configurada não pertence ao ambiente de produção da AbacatePay."
    );
  }

  if (!checkout.url?.startsWith("https://")) {
    throw new Error("A AbacatePay não retornou uma URL de checkout válida.");
  }

  return { url: checkout.url };
}
