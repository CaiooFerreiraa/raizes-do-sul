"use server";

import { prisma } from "@/infrastructure/database/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { v2 as cloudinary } from "cloudinary";

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

export async function createProductAction(formData: FormData) {
  try {
    const session = await auth();
    if (!session) return { success: false, error: "Não autorizado" };

    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const priceStr = formData.get("price") as string;
    const category = formData.get("category") as string | null;
    const groupId = (formData.get("groupId") as string | null) || null;
    const variantName = (formData.get("variantName") as string | null) || null;

    // Múltiplas imagens: campo "images" pode ter vários valores
    const imageFiles = formData.getAll("images") as File[];
    // Legado: campo "image" com arquivo único
    const singleImage = formData.get("image") as File | null;

    if (!name || !priceStr) {
      return { success: false, error: "Nome e preço são obrigatórios." };
    }

    const price = parseFloat(priceStr.replace(",", "."));
    if (isNaN(price)) {
      return { success: false, error: "Preço inválido." };
    }

    const uploadedUrls: string[] = [];

    // Processa múltiplas imagens (novo campo)
    const filesToProcess = imageFiles.filter((f) => f && f.size > 0);

    // Se não houver imagens no campo "images", tenta o campo legado "image"
    if (filesToProcess.length === 0 && singleImage && singleImage.size > 0) {
      filesToProcess.push(singleImage);
    }

    for (const file of filesToProcess) {
      if (file.size > MAX_FILE_SIZE) {
        return {
          success: false,
          error: `O arquivo "${file.name}" excede o limite de 10MB.`,
        };
      }
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      try {
        const result = await uploadBufferToCloudinary(
          buffer,
          "produtos-raizes-do-sul"
        );
        uploadedUrls.push(result.secure_url);
      } catch (uploadError) {
        console.error("Falha no upload Cloudinary:", uploadError);
        return { success: false, error: "Falha ao enviar imagem para a nuvem." };
      }
    }

    await prisma.product.create({
      data: {
        name,
        description: description || null,
        price,
        category: category || null,
        groupId: groupId || null,
        variantName: variantName || null,
        // Primeira imagem vai para imageUrl (compatibilidade), restantes em images[]
        imageUrl: uploadedUrls[0] ?? null,
        images: uploadedUrls,
      },
    });

    revalidatePath("/admin/produtos");
    revalidatePath("/loja");
    revalidatePath("/");

    return { success: true };
  } catch (error) {
    console.error("Erro ao criar produto:", error);
    return { success: false, error: "Erro interno ao criar produto." };
  }
}

export async function deleteProductAction(id: string) {
  try {
    const session = await auth();
    if (!session) return { success: false, error: "Não autorizado" };

    const product = await prisma.product.findUnique({
      where: { id },
      select: { imageUrl: true, images: true },
    });

    // Deleta todas as imagens do Cloudinary
    const allImageUrls = Array.from(
      new Set([
        ...(product?.images ?? []),
        ...(product?.imageUrl ? [product.imageUrl] : []),
      ])
    );

    for (const url of allImageUrls) {
      if (url.includes("cloudinary.com")) {
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
    }

    await prisma.product.delete({ where: { id } });

    revalidatePath("/admin/produtos");
    revalidatePath("/loja");
    revalidatePath("/");

    return { success: true };
  } catch (error) {
    console.error("Erro ao deletar produto:", error);
    return {
      success: false,
      error: "Erro ao deletar produto. Pode haver pedidos vinculados.",
    };
  }
}

export async function updateProductAction(id: string, formData: FormData) {
  try {
    const session = await auth();
    if (!session) return { success: false, error: "Não autorizado" };

    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const priceStr = formData.get("price") as string;
    const category = (formData.get("category") as string | null) || null;
    const groupId = (formData.get("groupId") as string | null) || null;
    const variantName = (formData.get("variantName") as string | null) || null;

    if (!name || !priceStr) {
      return { success: false, error: "Nome e preço são obrigatórios." };
    }

    const price = parseFloat(priceStr.replace(",", "."));
    if (isNaN(price)) {
      return { success: false, error: "Preço inválido." };
    }

    // Imagens existentes que o usuário MANTEVE (enviadas como JSON)
    const existingImagesRaw = formData.get("existingImages") as string | null;
    const keepUrls: string[] = existingImagesRaw
      ? (JSON.parse(existingImagesRaw) as string[])
      : [];

    // Busca imagens atuais do produto para saber quais deletar
    const current = await prisma.product.findUnique({
      where: { id },
      select: { images: true, imageUrl: true },
    });

    // URLs que existiam mas não estão em keepUrls → deletar do Cloudinary
    const allCurrent = Array.from(
      new Set([
        ...(current?.images ?? []),
        ...(current?.imageUrl ? [current.imageUrl] : []),
      ])
    );

    const toDelete = allCurrent.filter((url) => !keepUrls.includes(url));
    for (const url of toDelete) {
      if (url.includes("cloudinary.com")) {
        try {
          const parts = url.split("/");
          const filename = parts.pop();
          if (filename) {
            const publicId = filename.split(".")[0];
            const folder = parts.pop();
            await cloudinary.uploader.destroy(`${folder}/${publicId}`);
          }
        } catch (err) {
          console.error("Erro ao deletar imagem antiga do Cloudinary:", err);
        }
      }
    }

    // Novas imagens a fazer upload
    const newImageFiles = (formData.getAll("images") as File[]).filter(
      (f) => f && f.size > 0
    );

    const newUploadedUrls: string[] = [];
    for (const file of newImageFiles) {
      if (file.size > MAX_FILE_SIZE) {
        return {
          success: false,
          error: `O arquivo "${file.name}" excede o limite de 10MB.`,
        };
      }
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      try {
        const result = await uploadBufferToCloudinary(
          buffer,
          "produtos-raizes-do-sul"
        );
        newUploadedUrls.push(result.secure_url);
      } catch (uploadError) {
        console.error("Falha no upload Cloudinary:", uploadError);
        return { success: false, error: "Falha ao enviar nova imagem para a nuvem." };
      }
    }

    // Combina: imagens mantidas + novas uploadadas
    const finalImages = [...keepUrls, ...newUploadedUrls];

    await prisma.product.update({
      where: { id },
      data: {
        name,
        description: description || null,
        price,
        category: category || null,
        groupId: groupId || null,
        variantName: variantName || null,
        imageUrl: finalImages[0] ?? null,
        images: finalImages,
      },
    });

    revalidatePath("/admin/produtos");
    revalidatePath("/loja");
    revalidatePath(`/loja/${id}`);
    revalidatePath("/");

    return { success: true };
  } catch (error) {
    console.error("Erro ao atualizar produto:", error);
    return { success: false, error: "Erro interno ao atualizar produto." };
  }
}
