import type { Metadata } from "next";
import { Instrument_Serif } from "next/font/google";
import "./globals.css";

const instrumentSerif = Instrument_Serif({
  weight: "400",
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-serif-display",
  display: "swap",
});

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
    <html suppressHydrationWarning className={instrumentSerif.variable}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
