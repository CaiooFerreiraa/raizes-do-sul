"use server";

import { prisma } from "@/infrastructure/database/prisma";
import { revalidatePath } from "next/cache";

export async function updateOrderStatus(orderId: string, status: string) {
  try {
    await prisma.order.update({
      where: { id: orderId },
      data: { status },
    });
    revalidatePath("/admin/pedidos");
    return { success: true };
  } catch (error) {
    console.error("Erro ao atualizar status:", error);
    return { success: false, error: "Falha ao atualizar status." };
  }
}

export async function updatePaymentStatus(orderId: string, paymentStatus: string) {
  try {
    await prisma.order.update({
      where: { id: orderId },
      data: { paymentStatus } as any,
    });
    revalidatePath("/admin/pedidos");
    return { success: true };
  } catch (error) {
    console.error("Erro ao atualizar pagamento:", error);
    return { success: false, error: "Falha ao atualizar pagamento." };
  }
}

export async function toggleDepositPaid(orderId: string, depositPaid: boolean) {
  try {
    await prisma.order.update({
      where: { id: orderId },
      data: { depositPaid } as any,
    });
    revalidatePath("/admin/pedidos");
    return { success: true };
  } catch (error) {
    console.error("Erro ao atualizar sinal:", error);
    return { success: false, error: "Falha ao atualizar sinal." };
  }
}
