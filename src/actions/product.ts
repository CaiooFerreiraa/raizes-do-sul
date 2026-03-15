"use server"

import { prisma } from "@/infrastructure/database/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";

export async function createProductAction(formData: FormData) {
  const session = await auth();
  if (!session) throw new Error("Não autorizado");

  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const priceStr = formData.get("price") as string;
  const imageUrl = formData.get("imageUrl") as string;

  if (!name || !priceStr) {
    throw new Error("Nome e preço são obrigatórios.");
  }

  const price = parseFloat(priceStr.replace(",", "."));

  await prisma.product.create({
    data: {
      name,
      description,
      price,
      imageUrl,
    }
  });

  revalidatePath("/admin/produtos");
}

export async function deleteProductAction(id: string) {
  const session = await auth();
  if (!session) throw new Error("Não autorizado");

  await prisma.product.delete({ where: { id } });
  revalidatePath("/admin/produtos");
}
