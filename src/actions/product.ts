"use server"

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

export async function createProductAction(formData: FormData) {
  try {
    const session = await auth();
    if (!session) return { success: false, error: "Não autorizado" };

    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const priceStr = formData.get("price") as string;
    const image = formData.get("image") as File | null;

    if (!name || !priceStr) {
      return { success: false, error: "Nome e preço são obrigatórios." };
    }

    const price = parseFloat(priceStr.replace(",", "."));
    if (isNaN(price)) {
      return { success: false, error: "Preço inválido." };
    }

    let imageUrl = "";

    if (image && image.size > 0) {
      if (image.size > MAX_FILE_SIZE) {
        return { success: false, error: "A imagem deve ter no máximo 10MB." };
      }

      const bytes = await image.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const result = await new Promise<{ secure_url: string; public_id: string }>(
        (resolve, reject) => {
          cloudinary.uploader
            .upload_stream({ folder: "produtos-raizes-do-sul" }, (error, result) => {
              if (error || !result) return reject(error);
              resolve(result);
            })
            .end(buffer);
        }
      );
      
      imageUrl = result.secure_url;
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
      select: { imageUrl: true }
    });

    if (product?.imageUrl && product.imageUrl.includes("cloudinary.com")) {
      try {
        // Extrai o public_id da URL (Ex: .../upload/v12345/pasta/arquivo.jpg)
        const parts = product.imageUrl.split("/");
        const filename = parts.pop();
        if (filename) {
          const publicIdWithExt = filename;
          const publicId = publicIdWithExt.split(".")[0];
          const folder = parts.pop();
          // Chamamos com o prefixo da pasta se existir
          await cloudinary.uploader.destroy(`${folder}/${publicId}`);
        }
      } catch (error) {
        console.error("Erro ao deletar imagem do Cloudinary:", error);
      }
    }

    await prisma.product.delete({ where: { id } });
    
    revalidatePath("/admin/produtos");
    revalidatePath("/loja");
    revalidatePath("/");
    
    return { success: true };
  } catch (error) {
    console.error("Erro ao deletar produto:", error);
    return { success: false, error: "Erro ao deletar produto. Pode haver pedidos vinculados." };
  }
}
