// app/buscar/page.tsx

"use client";
export const dynamic = "force-dynamic";
import { Suspense } from "react";
import SearchResultsPage from "@/components/SearchResultsPage";



export default function BuscarPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SearchResultsPage />
    </Suspense>
  );
}
