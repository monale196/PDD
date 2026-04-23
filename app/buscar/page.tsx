import { Suspense } from "react";
import BuscarClient from "./BuscarClient";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export default function BuscarPage() {
  return (
    <Suspense fallback={null}>
      <BuscarClient />
    </Suspense>
  );
}