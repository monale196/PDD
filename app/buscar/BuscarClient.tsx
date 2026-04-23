"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useSearch } from "@/context/SearchContext";
import SearchResultsPage from "@/components/SearchResultsPage";

export default function BuscarClient() {
  const searchParams = useSearchParams();
  const keywordFromUrl = searchParams.get("keyword") || "";

  const { setKeyword } = useSearch();

  useEffect(() => {
    setKeyword(keywordFromUrl);
  }, [keywordFromUrl, setKeyword]);

  return <SearchResultsPage />;
}
