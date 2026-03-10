"use server";

import { prisma } from "@/infrastructure/database/prisma";
import { revalidatePath } from "next/cache";

interface OrderItemInput {
  productId: string;
  name: string; // Add name to handle mock products
  quantity: number;
  price: number;
}

interface CreateOrderInput {
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  notes?: string;
  items: OrderItemInput[];
}

export async function createOrder(data: CreateOrderInput) {
  try {
    if (!data.items || data.items.length === 0) {
      return { success: false, error: "Nenhum produto selecionado." };
    }

    const total = data.items.reduce<number>(
      (acc, item) => acc + item.price * item.quantity,
      0
    );

    const order = await prisma.order.create({
      data: {
        customerName: data.customerName,
        customerEmail: data.customerEmail,
        customerPhone: data.customerPhone || null,
        notes: data.notes || null,
        total,
        status: "PENDING",
        items: {
          create: await Promise.all(
            data.items.map(async (item) => {
              // Try to find if product exists in DB (not a mock ID)
              let dbProduct: { id: string } | null = null;
              if (item.productId && item.productId.length > 5) {
                dbProduct = await prisma.product.findUnique({
                  where: { id: item.productId },
                });
              }

              // Use unchecked create format to avoid 'product' relation requirement if types lag
              return {
                productId: dbProduct ? dbProduct.id : null,
                productName: item.name,
                quantity: item.quantity,
                price: item.price,
              };
            })
          ) as Parameters<typeof prisma.orderItem.create>[0]["data"][],
        },
      },
    });

    revalidatePath("/admin/pedidos");
    return { success: true, orderId: order.id };
  } catch (error) {
    console.error("Erro ao criar encomenda:", error);
    return { success: false, error: "Erro interno ao processar a encomenda. Tente novamente." };
  }
}
