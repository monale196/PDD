// app/buscar/page.tsx

"use client";
import { Suspense } from "react";
import SearchResultsPage from "@/components/SearchResultsPage";

export const dynamic = "force-dynamic";

export default function BuscarPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SearchResultsPage />
    </Suspense>
  );
}
