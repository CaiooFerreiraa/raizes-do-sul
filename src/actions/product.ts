"use server"

import { prisma } from "@/infrastructure/database/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { writeFile, unlink } from "fs/promises";
import { join } from "path";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export async function createProductAction(formData: FormData) {
  const session = await auth();
  if (!session) throw new Error("Não autorizado");

  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const priceStr = formData.get("price") as string;
  const image = formData.get("image") as File | null;

  if (!name || !priceStr) {
    throw new Error("Nome e preço são obrigatórios.");
  }

  const price = parseFloat(priceStr.replace(",", "."));
  let imageUrl = "";

  if (image && image.size > 0) {
    if (image.size > MAX_FILE_SIZE) {
      throw new Error("A imagem deve ter no máximo 10MB.");
    }

    const bytes = await image.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Gerar um nome único para o arquivo
    const filename = `${Date.now()}-${image.name.replace(/\s+/g, "-")}`;
    const path = join(process.cwd(), "public", "products", filename);
    
    await writeFile(path, buffer);
    imageUrl = `/products/${filename}`;
  }

  await prisma.product.create({
    data: {
      name,
      description,
      price,
      imageUrl: imageUrl || null,
    }
  });

  revalidatePath("/admin/produtos");
  revalidatePath("/loja");
  revalidatePath("/");
}

export async function deleteProductAction(id: string) {
  const session = await auth();
  if (!session) throw new Error("Não autorizado");

  const product = await prisma.product.findUnique({
    where: { id },
    select: { imageUrl: true }
  });

  if (product?.imageUrl) {
    try {
      const filePath = join(process.cwd(), "public", product.imageUrl);
      await unlink(filePath);
    } catch (error) {
      console.error("Erro ao deletar imagem:", error);
    }
  }

  await prisma.product.delete({ where: { id } });
  revalidatePath("/admin/produtos");
  revalidatePath("/loja");
  revalidatePath("/");
}
