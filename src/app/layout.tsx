import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "leaflet/dist/leaflet.css";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SiMoHi-RJ | Sistema de Monitoramento Hidrológico do Rio de Janeiro",
  description: "Sistema de monitoramento hidrológico em tempo real para o Estado do Rio de Janeiro. Acompanhe 7 Macrorregiões Ambientais e 30 Sub-bacias Hidrográficas com alertas inteligentes.",
  keywords: [
    "monitoramento hidrológico",
    "Rio de Janeiro",
    "alerta de enchente",
    "bacia hidrográfica",
    "defesa civil",
    "tempo real",
    "INEA",
    "CEMADEN",
    "Alerta Rio",
  ],
  authors: [{ name: "Governo do Estado do Rio de Janeiro" }],
  icons: {
    icon: "/logo.svg",
  },
  openGraph: {
    title: "SiMoHi-RJ - Monitoramento Hidrológico",
    description: "Sistema de monitoramento hidrológico em tempo real para o Estado do Rio de Janeiro",
    type: "website",
    locale: "pt_BR",
  },
  twitter: {
    card: "summary_large_image",
    title: "SiMoHi-RJ - Monitoramento Hidrológico",
    description: "Sistema de monitoramento hidrológico em tempo real para o Estado do Rio de Janeiro",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground min-h-screen`}
      >
        <TooltipProvider>
          {children}
          <Toaster />
        </TooltipProvider>
      </body>
    </html>
  );
}
