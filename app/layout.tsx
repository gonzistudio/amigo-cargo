import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Amigo Cargo | Envíos de China a Venezuela",
  description:
    "Envíos marítimos, bodega en China, consolidación gratuita y acompañamiento para importar desde China hacia Venezuela.",
  icons: { icon: "/favicon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
