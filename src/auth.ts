import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/infrastructure/database/prisma";
import bcrypt from "bcryptjs";
import Credentials from "next-auth/providers/credentials";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      phone?: string | null;
      street?: string | null;
      number?: string | null;
      neighborhood?: string | null;
      reference?: string | null;
    }
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
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

        // DEBUG: Logging for authorize
        // console.log("Login attempt:", { 
        //   email: credentials.email, 
        //   envEmail: process.env.NEXT_PUBLIC_ADMIN_EMAIL,
        //   match: credentials.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL 
        // });

        // Hardcoded Admin Fallback
        const adminEmail = (process.env.NEXT_PUBLIC_ADMIN_EMAIL || "").toLowerCase().trim();
        const adminPassword = process.env.ADMIN_PASSWORD;
        const inputEmail = (credentials.email as string || "").toLowerCase().trim();

        if (
          inputEmail === adminEmail &&
          credentials.password === adminPassword
        ) {
          return { id: "admin-id", name: "Admin", email: adminEmail };
        }

        // Database Lookup
        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
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
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.phone = (user as any).phone;
        token.street = (user as any).street;
        token.number = (user as any).number;
        token.neighborhood = (user as any).neighborhood;
        token.reference = (user as any).reference;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.phone = token.phone as string;
        session.user.street = token.street as string;
        session.user.number = token.number as string;
        session.user.neighborhood = token.neighborhood as string;
        session.user.reference = token.reference as string;
      }
      return session;
    },
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isPublicPage = ["/login", "/register"].includes(nextUrl.pathname);

      if (isPublicPage) {
        if (isLoggedIn) {
          return Response.redirect(new URL("/", nextUrl));
        }
        return true;
      }

      return isLoggedIn;
    },
  },
});
