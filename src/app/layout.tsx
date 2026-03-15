import type { Metadata } from "next";
import { Inter, DM_Serif_Display } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/providers/session-provider";

const sans = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const display = DM_Serif_Display({
  weight: "400",
  variable: "--font-display",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Raízes do Sul | Massas & Bolos Artesanais",
  description: "Tradição e sabor em cada fatia. Encomende massas e doces artesanais preparados com receitas de família.",
  icons: {
    icon: [
      { url: "/logo.webp" },
      { url: "/favicon.ico", sizes: "any" }
    ],
    apple: "/logo.webp",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body
        className={`${sans.variable} ${display.variable} font-sans antialiased selection:bg-primary/20`}
      >
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
