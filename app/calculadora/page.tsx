import type { Metadata } from "next";
import AppHeader from "@/components/AppHeader";
import Calculator from "./Calculator";

export const metadata: Metadata = {
  title: "Calculadora de envíos | Amigo Cargo",
  description: "Estima el costo de tu envío marítimo desde China a Venezuela.",
};

export default function CalculadoraPage() {
  return (
    <>
      <AppHeader />
      <main className="app-shell">
        <p className="app-eyebrow"><span /> Herramienta</p>
        <h1 className="app-title">Calculadora de envíos</h1>
        <p className="app-lead">
          Ingresa el peso y, si los tienes, los datos del bulto para estimar el costo de tu
          envío marítimo consolidado. Es un estimado referencial — confírmalo con nuestro equipo.
        </p>
        <Calculator />
      </main>
    </>
  );
}
