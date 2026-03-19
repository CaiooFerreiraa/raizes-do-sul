"use server";

import { prisma } from "@/infrastructure/database/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { v2 as cloudinary } from "cloudinary";
import type { Flavor } from "@prisma/client";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

async function uploadBufferToCloudinary(
  buffer: Buffer,
  folder: string
): Promise<{ secure_url: string; public_id: string }> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder },
      (error, result) => {
        if (error) return reject(error);
        if (!result) return reject(new Error("Cloudinary não retornou resultado"));
        resolve(result);
      }
    );
    stream.end(buffer);
  });
}

async function deleteFromCloudinary(url: string): Promise<void> {
  if (!url.includes("cloudinary.com")) return;
  try {
    const parts = url.split("/");
    const filename = parts.pop();
    if (filename) {
      const publicId = filename.split(".")[0];
      const folder = parts.pop();
      await cloudinary.uploader.destroy(`${folder}/${publicId}`);
    }
  } catch (error) {
    console.error("Erro ao deletar imagem do Cloudinary:", error);
  }
}

export async function createFlavorAction(productId: string, formData: FormData) {
  try {
    const session = await auth();
    if (!session) return { success: false, error: "Não autorizado" };

    const name = formData.get("name") as string;
    const priceStr = formData.get("price") as string;
    const imageFile = formData.get("image") as File | null;

    if (!name || !priceStr) {
      return { success: false, error: "Nome e preço são obrigatórios." };
    }

    const price = parseFloat(priceStr.replace(",", "."));
    if (isNaN(price)) {
      return { success: false, error: "Preço inválido." };
    }

    let imageUrl: string | null = null;

    if (imageFile && imageFile.size > 0) {
      if (imageFile.size > MAX_FILE_SIZE) {
        return { success: false, error: "A imagem excede o limite de 10MB." };
      }
      const bytes = await imageFile.arrayBuffer();
      const buffer = Buffer.from(bytes);
      try {
        const result = await uploadBufferToCloudinary(buffer, "sabores-raizes-do-sul");
        imageUrl = result.secure_url;
      } catch (uploadError) {
        console.error("Falha no upload Cloudinary:", uploadError);
        return { success: false, error: "Falha ao enviar imagem para a nuvem." };
      }
    }

    await prisma.flavor.create({
      data: {
        name,
        price,
        imageUrl,
        productId,
      },
    });

    revalidatePath("/admin/produtos");
    revalidatePath("/loja");
    revalidatePath(`/loja/${productId}`);

    return { success: true };
  } catch (error) {
    console.error("Erro ao criar sabor:", error);
    return { success: false, error: "Erro interno ao criar sabor." };
  }
}

export async function updateFlavorAction(flavorId: string, formData: FormData) {
  try {
    const session = await auth();
    if (!session) return { success: false, error: "Não autorizado" };

    const name = formData.get("name") as string;
    const priceStr = formData.get("price") as string;
    const imageFile = formData.get("image") as File | null;
    const keepExistingImage = formData.get("keepExistingImage") === "true";

    if (!name || !priceStr) {
      return { success: false, error: "Nome e preço são obrigatórios." };
    }

    const price = parseFloat(priceStr.replace(",", "."));
    if (isNaN(price)) {
      return { success: false, error: "Preço inválido." };
    }

    const currentFlavor = await prisma.flavor.findUnique({
      where: { id: flavorId },
      select: { imageUrl: true, productId: true },
    });

    if (!currentFlavor) {
      return { success: false, error: "Sabor não encontrado." };
    }

    let imageUrl: string | null | undefined = undefined;

    if (imageFile && imageFile.size > 0) {
      if (imageFile.size > MAX_FILE_SIZE) {
        return { success: false, error: "A imagem excede o limite de 10MB." };
      }
      
      // Upload nova imagem
      const bytes = await imageFile.arrayBuffer();
      const buffer = Buffer.from(bytes);
      try {
        const result = await uploadBufferToCloudinary(buffer, "sabores-raizes-do-sul");
        imageUrl = result.secure_url;
        
        // Deletar imagem antiga
        if (currentFlavor.imageUrl) {
          await deleteFromCloudinary(currentFlavor.imageUrl);
        }
      } catch (uploadError) {
        console.error("Falha no upload Cloudinary:", uploadError);
        return { success: false, error: "Falha ao enviar imagem para a nuvem." };
      }
    } else if (!keepExistingImage && currentFlavor.imageUrl) {
      // Remover imagem existente
      await deleteFromCloudinary(currentFlavor.imageUrl);
      imageUrl = null;
    }

    await prisma.flavor.update({
      where: { id: flavorId },
      data: {
        name,
        price,
        ...(imageUrl !== undefined && { imageUrl }),
      },
    });

    revalidatePath("/admin/produtos");
    revalidatePath("/loja");
    revalidatePath(`/loja/${currentFlavor.productId}`);

    return { success: true };
  } catch (error) {
    console.error("Erro ao atualizar sabor:", error);
    return { success: false, error: "Erro interno ao atualizar sabor." };
  }
}

export async function deleteFlavorAction(flavorId: string) {
  try {
    const session = await auth();
    if (!session) return { success: false, error: "Não autorizado" };

    const flavor = await prisma.flavor.findUnique({
      where: { id: flavorId },
      select: { imageUrl: true, productId: true },
    });

    if (!flavor) {
      return { success: false, error: "Sabor não encontrado." };
    }

    // Deletar imagem do Cloudinary
    if (flavor.imageUrl) {
      await deleteFromCloudinary(flavor.imageUrl);
    }

    await prisma.flavor.delete({ where: { id: flavorId } });

    revalidatePath("/admin/produtos");
    revalidatePath("/loja");
    revalidatePath(`/loja/${flavor.productId}`);

    return { success: true };
  } catch (error) {
    console.error("Erro ao deletar sabor:", error);
    return { success: false, error: "Erro ao deletar sabor." };
  }
}

export async function toggleFlavorAvailabilityAction(flavorId: string) {
  try {
    const session = await auth();
    if (!session) return { success: false, error: "Não autorizado" };

    const flavor = await prisma.flavor.findUnique({
      where: { id: flavorId },
      select: { isAvailable: true, productId: true },
    });

    if (!flavor) {
      return { success: false, error: "Sabor não encontrado." };
    }

    await prisma.flavor.update({
      where: { id: flavorId },
      data: { isAvailable: !flavor.isAvailable },
    });

    revalidatePath("/admin/produtos");
    revalidatePath("/loja");
    revalidatePath(`/loja/${flavor.productId}`);

    return { success: true, isAvailable: !flavor.isAvailable };
  } catch (error) {
    console.error("Erro ao alterar disponibilidade:", error);
    return { success: false, error: "Erro ao alterar disponibilidade." };
  }
}

export async function getFlavorsByProductId(productId: string) {
  try {
    const flavors = await prisma.flavor.findMany({
      where: { productId },
      orderBy: { createdAt: "asc" },
    });
    
    return flavors.map((f: Flavor) => ({
      id: f.id,
      name: f.name,
      price: f.price.toString(),
      imageUrl: f.imageUrl,
      isAvailable: f.isAvailable,
    }));
  } catch (error) {
    console.error("Erro ao buscar sabores:", error);
    return [];
  }
}
