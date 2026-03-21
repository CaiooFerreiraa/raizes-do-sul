"use server";

import { prisma } from "@/infrastructure/database/prisma";
import { revalidatePath } from "next/cache";
import { createAbacatePayCheckout } from "@/lib/abacate-pay";

interface OrderItemInput {
  productId: string;
  flavorId?: string;
  flavorName?: string;
  name: string; 
  quantity: number;
  price: number;
  imageUrl?: string;
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
      (acc: number, item: OrderItemInput) => acc + item.price * item.quantity,
      0
    );

    // Create order items first to map them correctly
    const orderItems = await Promise.all(
      data.items.map(async (item: OrderItemInput) => {
        let dbProduct: { id: string } | null = null;
        let dbFlavor: { id: string; name: string } | null = null;
        
        if (item.productId && item.productId.length > 5) {
          dbProduct = await prisma.product.findUnique({
            where: { id: item.productId },
          });
        }

        if (item.flavorId && item.flavorId.length > 5) {
          dbFlavor = await prisma.flavor.findUnique({
            where: { id: item.flavorId },
            select: { id: true, name: true },
          });
        }

        return {
          productId: dbProduct ? dbProduct.id : null,
          productName: item.name,
          flavorId: dbFlavor ? dbFlavor.id : null,
          flavorName: item.flavorName || (dbFlavor ? dbFlavor.name : null),
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

    let paymentUrl: string | undefined = undefined;

    if (data.paymentMethod === "CREDIT") {
       try {
        const checkout = await createAbacatePayCheckout({
          externalId: order.id,
          customer: {
            name: data.customerName,
            email: data.customerEmail,
            cellphone: data.customerPhone || "(00) 00000-0000",
          },
          products: data.items.map((item) => ({
             externalId: item.flavorId ? `v2-${item.productId}-${item.flavorId}` : `v2-${item.productId}`,
             name: item.name,
             quantity: item.quantity,
             price: Math.round(item.price * 100),
             imageUrl: item.imageUrl,
          })),
          returnUrl: `${process.env.NEXT_PUBLIC_APP_URL}/acompanhar/${order.id}`,
          completionUrl: `${process.env.NEXT_PUBLIC_APP_URL}/acompanhar/${order.id}?status=paid`,
        });
        
        paymentUrl = checkout.url;
       } catch (apError) {
         console.error("Erro ao gerar AbacatePay V2:", apError);
         // Optionally notify the user but keep the order
       }
    }

    revalidatePath("/admin/pedidos");
    return { success: true, orderId: order.id, paymentUrl };
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
