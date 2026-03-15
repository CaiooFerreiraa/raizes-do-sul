import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/infrastructure/database/prisma";
import bcrypt from "bcryptjs";
import Credentials from "next-auth/providers/credentials";
import { authConfig } from "./auth.config";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const adminEmail = (process.env.NEXT_PUBLIC_ADMIN_EMAIL || "").toLowerCase().trim();
        const adminPassword = process.env.ADMIN_PASSWORD;
        const inputEmail = (credentials.email as string || "").toLowerCase().trim();

        if (
          inputEmail === adminEmail &&
          credentials.password === adminPassword
        ) {
          return { id: "admin-id", name: "Admin", email: adminEmail };
        }

        const user = await prisma.user.findUnique({
          where: { email: (credentials.email as string).toLowerCase().trim() },
        });

        if (!user || !user.password) return null;

        const isPasswordValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        );

        if (!isPasswordValid) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          street: user.street,
          number: user.number,
          neighborhood: user.neighborhood,
          reference: user.reference,
        };
      },
    }),
  ],
});
