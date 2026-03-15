import type { NextAuthConfig } from "next-auth";

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
    phone?: string | null;
    street?: string | null;
    number?: string | null;
    neighborhood?: string | null;
    reference?: string | null;
  }
}

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isPublicPage = ["/login", "/register"].includes(nextUrl.pathname);
      const isLandingPage = nextUrl.pathname === "/";
      const isLoja = nextUrl.pathname.startsWith("/loja");
      const isEncomenda = nextUrl.pathname.startsWith("/encomenda");
      const isAcompanhar = nextUrl.pathname.startsWith("/acompanhar");

      // Redirecionar se já estiver logado e tentar acessar login/register
      if (isPublicPage) {
        if (isLoggedIn) {
          return Response.redirect(new URL("/", nextUrl));
        }
        return true;
      }

      // Proteger Admin
      if (nextUrl.pathname.startsWith("/admin")) {
        const isAdmin = auth?.user?.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL;
        return isLoggedIn && isAdmin;
      }

      // Proteger Perfil
      if (nextUrl.pathname.startsWith("/perfil")) {
        return isLoggedIn;
      }

      // Todas as outras páginas são públicas (Home, Encomenda, Loja, Acompanhar)
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.phone = user.phone;
        token.street = user.street;
        token.number = user.number;
        token.neighborhood = user.neighborhood;
        token.reference = user.reference;
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
  },
  providers: [], // Providers are added in auth.ts
} satisfies NextAuthConfig;
