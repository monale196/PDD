"use client";

import SearchResultsPage from "@/components/SearchResultsPage";

//Esto evita que Next.js intente prerenderizar la página
export const dynamic = "force-dynamic";

export default function BuscarPage() {
  return <SearchResultsPage />;
}


