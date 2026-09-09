import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ARShot — Vos produits en 3D et en AR",
  description:
    "D'une simple photo, créez le modèle 3D et l'expérience AR de vos produits. QR code, export Amazon, viewer sans application.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html suppressHydrationWarning>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
