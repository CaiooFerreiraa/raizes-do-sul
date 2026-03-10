"use server";

import { prisma } from "@/infrastructure/database/prisma";
import { revalidatePath } from "next/cache";

interface OrderItemInput {
  productId: string;
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

    const total = data.items.reduce(
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
          create: data.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
          })),
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
