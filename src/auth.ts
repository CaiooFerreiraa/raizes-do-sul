import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/infrastructure/database/prisma";
import bcrypt from "bcryptjs";
import Credentials from "next-auth/providers/credentials";
import { authConfig } from "./auth.config";

const ADMIN_EMAIL = (process.env.NEXT_PUBLIC_ADMIN_EMAIL || "").toLowerCase().trim();
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

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

        const inputEmail = (credentials.email as string).toLowerCase().trim();
        const inputPassword = credentials.password as string;

        // Fast Admin Check
        if (inputEmail === ADMIN_EMAIL && inputPassword === ADMIN_PASSWORD) {
          return { id: "admin-id", name: "Admin", email: ADMIN_EMAIL };
        }

        const user = await prisma.user.findUnique({
          where: { email: inputEmail },
        });

        if (!user || !user.password) return null;

        // bcryptjs is slow in JS environments. 
        const isPasswordValid = await bcrypt.compare(inputPassword, user.password);

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
