import type { NextAuthConfig } from "next-auth";

/**
 * Consolidação de tipos para NextAuth v5.
 * Aumentamos o módulo 'next-auth' diretamente para Session e User.
 */
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

  interface User {
    id?: string;
    phone?: string | null;
    street?: string | null;
    number?: string | null;
    neighborhood?: string | null;
    reference?: string | null;
  }
}

const ADMIN_EMAIL = (process.env.NEXT_PUBLIC_ADMIN_EMAIL || "").toLowerCase().trim();

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const pathname = nextUrl.pathname;
      
      const isPublicPage = pathname === "/login" || pathname === "/register";
      const isStaticFile = pathname.includes(".");
      const isPublicFeature = 
        pathname === "/" || 
        pathname.startsWith("/loja") || 
        pathname.startsWith("/products") ||
        isStaticFile;

      if (isPublicPage) {
        if (isLoggedIn) {
          return Response.redirect(new URL("/", nextUrl));
        }
        return true;
      }

      if (isPublicFeature) return true;
      if (!isLoggedIn) return false;
      
      if (pathname.startsWith("/admin")) {
        // Use normalized comparisons
        const isAdmin = auth?.user?.email === ADMIN_EMAIL;
        return isAdmin;
      }

      return true;
    },
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id as string;
        token.name = user.name;
        token.email = user.email;
        token.phone = (user as any).phone;
        token.street = (user as any).street;
        token.number = (user as any).number;
        token.neighborhood = (user as any).neighborhood;
        token.reference = (user as any).reference;
      }
      
      if (trigger === "update" && session) {
        return { ...token, ...session.user };
      }

      return token;
    },
    async session({ session, token }: { session: any, token: any }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.name = token.name as string;
        session.user.email = token.email as string;
        session.user.phone = token.phone as string;
        session.user.street = token.street as string;
        session.user.number = token.number as string;
        session.user.neighborhood = token.neighborhood as string;
        session.user.reference = token.reference as string;
      }
      return session;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
