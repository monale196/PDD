"use client";


import { createContext, useState, useEffect, ReactNode } from "react";
import { NewsProvider } from "../context/NewsContext";



/* =======================
   Language Context
======================= */
export const LanguageContext = createContext<{
  language: "ES" | "EN";
  setLanguage: (lang: "ES" | "EN") => void;
}>({
  language: "ES",
  setLanguage: () => {},
});

/* =======================
   Entrevistas Context
======================= */
export interface Entrevista {
  id: number;
  titulo: string;
  fecha: string;
  descripcion: string;
  likes: number;
  imgUrl?: string;
}

export const EntrevistasContext = createContext<{
  entrevistas: Entrevista[];
  setEntrevistas: React.Dispatch<React.SetStateAction<Entrevista[]>>;
}>({
  entrevistas: [],
  setEntrevistas: () => {},
});

/* =======================
   Search Context
======================= */
export const SearchContext = createContext<{
  keyword: string;
  setKeyword: (v: string) => void;
  dateFilter: string;
  setDateFilter: (v: string) => void;
  clearSearch: () => void; // 🔹 agregado
}>({
  keyword: "",
  setKeyword: () => {},
  dateFilter: "",
  setDateFilter: () => {},
  clearSearch: () => {}, // 🔹 fallback seguro
});

/* =======================
   RootProviders Component
======================= */
export default function RootProviders({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<"ES" | "EN">("ES");
  const [entrevistas, setEntrevistas] = useState<Entrevista[]>([]);
  const [keyword, setKeyword] = useState("");
  const [dateFilter, setDateFilter] = useState("");

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      document.querySelectorAll(".menu-open").forEach((menu) => {
        if (!menu.contains(target)) menu.classList.remove("menu-open");
      });
    };
    document.addEventListener("click", handleClickOutside);
    return () =>
      document.removeEventListener("click", handleClickOutside);
  }, []);

  // 🔹 función para limpiar búsqueda y filtro de fecha
  const clearSearch = () => {
    setKeyword("");
    setDateFilter("");
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      <EntrevistasContext.Provider value={{ entrevistas, setEntrevistas }}>
        <SearchContext.Provider
          value={{ keyword, setKeyword, dateFilter, setDateFilter, clearSearch }}
        >
          <NewsProvider>{children}</NewsProvider>
        </SearchContext.Provider>
      </EntrevistasContext.Provider>
    </LanguageContext.Provider>
  );
}
