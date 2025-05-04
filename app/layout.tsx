import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mi Página con Fondo Negro",
  description: "Una simple página con fondo negro",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
