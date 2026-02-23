

"use client";

import { createContext, useContext, useState } from "react";


export const dynamic = "force-dynamic";

interface SearchContextType {
  keyword: string;
  dateFilter: string | null; // ISO yyyy-mm-dd
  setKeyword: (v: string) => void;
  setDateFilter: (v: string | null) => void;
  clearSearch: () => void;
  formattedDate?: (lang?: "ES" | "EN") => string; // opcional para mostrar fecha formateada
}

export const SearchContext = createContext<SearchContextType>({
  keyword: "",
  dateFilter: null,
  setKeyword: () => {},
  setDateFilter: () => {},
  clearSearch: () => {},
  formattedDate: () => "",
});

export function SearchProvider({ children }: { children: React.ReactNode }) {
  const [keyword, setKeyword] = useState("");
  const [dateFilter, setDateFilter] = useState<string | null>(null);

  const clearSearch = () => {
    setKeyword("");
    setDateFilter(null);
  };

  const formattedDate = (lang: "ES" | "EN" = "ES") => {
    if (!dateFilter) return "";
    const d = new Date(dateFilter);
    if (isNaN(d.getTime())) return "";
    return d.toLocaleDateString(lang === "ES" ? "es-ES" : "en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <SearchContext.Provider value={{ keyword, dateFilter, setKeyword, setDateFilter, clearSearch, formattedDate }}>
      {children}
    </SearchContext.Provider>
  );
}

export const useSearch = () => useContext(SearchContext);
