"use server"

import { auth } from "@/auth";
import { prisma } from "@/infrastructure/database/prisma";
import { revalidatePath } from "next/cache";

export async function updateProfileAction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.email) {
    return { error: "Não autorizado" };
  }

  const name = formData.get("name") as string;
  const phone = formData.get("phone") as string;
  const street = formData.get("street") as string;
  const number = formData.get("number") as string;
  const neighborhood = formData.get("neighborhood") as string;
  const reference = formData.get("reference") as string;

  try {
    await prisma.user.update({
      where: { email: session.user.email },
      data: {
        name,
        phone,
        street,
        number,
        neighborhood,
        reference,
      },
    });

    revalidatePath("/perfil");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: "Falha ao atualizar perfil" };
  }
}
