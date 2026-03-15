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
  deliveryType: string;
  pickupPoint?: string;
  street?: string;
  number?: string;
  neighborhood?: string;
  reference?: string;
  paymentMethod: string;
  paymentStatus?: string;
  scheduledDate?: string; // ISO string
  scheduledTime?: string;
  notes?: string;
  items: OrderItemInput[];
}

export async function createOrder(data: CreateOrderInput) {
  try {
    if (!data.items || data.items.length === 0) {
      return { success: false, error: "Nenhum produto selecionado." };
    }

    const total = data.items.reduce<number>(
      (acc: number, item: any) => acc + item.price * item.quantity,
      0
    );

    // Create order items first to map them correctly
    const orderItems = await Promise.all(
      data.items.map(async (item: any) => {
        let dbProduct: { id: string } | null = null;
        if (item.productId && item.productId.length > 5) {
          dbProduct = await prisma.product.findUnique({
            where: { id: item.productId },
          });
        }

        return {
          productId: dbProduct ? dbProduct.id : null,
          productName: item.name,
          quantity: item.quantity,
          price: item.price,
        };
      })
    );

    const order = await prisma.order.create({
      data: {
        customerName: data.customerName,
        customerEmail: data.customerEmail,
        customerPhone: data.customerPhone || null,
        deliveryType: data.deliveryType,
        pickupPoint: data.pickupPoint || null,
        street: data.street || null,
        number: data.number || null,
        neighborhood: data.neighborhood || null,
        reference: data.reference || null,
        paymentMethod: data.paymentMethod,
        paymentStatus: data.paymentStatus || "PENDING",
        scheduledDate: data.scheduledDate ? new Date(data.scheduledDate) : null,
        scheduledTime: data.scheduledTime || null,
        notes: data.notes || null,
        total,
        status: "PENDING",
        items: {
          create: orderItems,
        },
      } as any,
    });

    revalidatePath("/admin/pedidos");
    return { success: true, orderId: order.id };
  } catch (error) {
    console.error("Erro ao criar encomenda:", error);
    return { success: false, error: "Erro interno ao processar a encomenda. Tente novamente." };
  }
}

export async function findOrdersByContact(contact: string) {
  try {
    if (!contact || contact.trim() === "") {
      return { success: false, error: "Informe um e-mail ou WhatsApp válido." };
    }

    const cleanContact = contact.trim();
    const orders = await prisma.order.findMany({
      where: {
        OR: [
          { id: cleanContact },
          { customerEmail: { equals: cleanContact, mode: 'insensitive' } },
          { customerPhone: { contains: cleanContact } }
        ]
      },
      include: {
        items: true
      },
      orderBy: { createdAt: 'desc' },
      take: 20
    });

    if (orders.length === 0) {
      return { success: false, error: "Nenhum pedido encontrado com esse dado." };
    }

    // Serialize to plain object for Client Components
    const serializedOrders = JSON.parse(JSON.stringify(orders));

    return { 
      success: true, 
      orders: serializedOrders 
    };
  } catch (error) {
    console.error("Erro ao buscar encomendas:", error);
    return { success: false, error: "Erro interno. Tente novamente." };
  }
}
