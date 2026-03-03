import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ARShot — AR pour e-commerçants",
  description: "Créez des expériences AR pour vos produits en quelques minutes",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
