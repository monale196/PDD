"use client";
export const dynamic = "force-dynamic";

import SearchResultsPage from "@/components/SearchResultsPage";

//Esto evita que Next.js intente prerenderizar la página


export default function BuscarPage() {
  return <SearchResultsPage />;
}


