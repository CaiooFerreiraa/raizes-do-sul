"use server"

import { signIn, signOut } from "@/auth";
import { AuthError } from "next-auth";
import { prisma } from "@/infrastructure/database/prisma";
import bcrypt from "bcryptjs";

export async function loginAction(formData: FormData) {
  try {
    const email = formData.get("email");
    const password = formData.get("password");

    if (!email || !password) return { error: "Preencha todos os campos." };

    await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    return { success: true };
  } catch (error) {
    if (error instanceof AuthError) {
      if (error.type === "CredentialsSignin") return { error: "Credenciais inválidas." };
      return { error: "Erro na autenticação." };
    }
    // Don't throw here to avoid full page error
    return { error: "Algo deu errado. Tente novamente." };
  }
}

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
