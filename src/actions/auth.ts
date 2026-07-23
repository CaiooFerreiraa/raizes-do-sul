"use server";
import { signOut } from "@/auth";
import { prisma } from "@/infrastructure/database/prisma";
import bcrypt from "bcryptjs";

export async function registerAction(formData: FormData) {
  const name = formData.get("name") as string;
  const email = (formData.get("email") as string).toLowerCase().trim();
  const password = formData.get("password") as string;
  
  // Delivery info
  const phone = formData.get("phone") as string;
  const street = formData.get("street") as string;
  const number = formData.get("number") as string;
  const neighborhood = formData.get("neighborhood") as string;
  const reference = formData.get("reference") as string;

  if (!name || !email || !password) {
    return { error: "Nome, e-mail e senha são obrigatórios." };
  }

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    return { error: "Este e-mail já está em uso." };
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      phone,
      street,
      number,
      neighborhood,
      reference,
    },
  });

  return { success: true };
}

export async function logoutAction() {
  await signOut({ redirectTo: "/login" });
}
