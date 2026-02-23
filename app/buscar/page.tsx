// app/buscar/page.tsx
import { Suspense } from "react";
import BuscarClient from "./BuscarClient";

export default function BuscarPage() {
  return (
    <Suspense fallback={<div>Cargando búsqueda...</div>}>
      <BuscarClient />
    </Suspense>
  );
}
