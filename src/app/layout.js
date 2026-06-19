import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata = {
  title: "Gestión de Cobranzas — Sistema de Gestión",
  description: "Sistema inteligente de gestión de cobranzas con automatización, seguimiento en tiempo real y técnicas UX avanzadas.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full">{children}</body>
    </html>
  );
}
