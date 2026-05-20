import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ClientShell from "@/components/ClientShell";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://sys403.online"),
  title: "SYS_403 | Forjar Tu ADN",
  description: "Lo que el sistema te niega, nosotros lo convertimos en estética. SYS_403 es un bloque total sólido de streetwear exclusivo // Acceso Denegado.",
  openGraph: {
    title: "SYS_403 | Forjar Tu ADN",
    description: "No somos una marca de ropa. Somos un código de error total sólido con identidad propia. Viste el glitch.",
    url: "https://sys403.online",
    siteName: "SYS_403",
    images: [
      {
        url: "/sys_403.png",
        width: 800,
        height: 800,
        alt: "SYS_403 Logo",
      },
    ],
    locale: "es_CO",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SYS_403 | Forjar Tu ADN",
    description: "Lo que el sistema te niega, nosotros lo convertimos en estética.",
    images: ["/sys_403.png"],
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
      <body className="bg-urban-bone text-urban-charcoal dark:bg-urban-charcoal dark:text-urban-bone min-h-screen flex flex-col crt">
        <ClientShell>{children}</ClientShell>
      </body>
    </html>
  );
}
