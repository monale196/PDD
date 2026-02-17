"use client";

import { useContext, useEffect, useMemo, useState } from "react";
import { NewsContext, Contenido } from "../context/NewsContext";
import { SearchContext } from "../context/SearchContext";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { LanguageContext } from "../app/RootProviders";

type SortOption = "title-asc" | "title-desc";

export default function SearchResultsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const { articles } = useContext(NewsContext);
  const { keyword, setKeyword, setDateFilter } = useContext(SearchContext);
  const { language } = useContext(LanguageContext);

  const keywordFromUrl = searchParams.get("keyword") || "";
  const [sortBy, setSortBy] = useState<SortOption>("title-asc");

  // Traducciones dinámicas
  const t = {
    es: {
      resultsFor: "Resultados para",
      goBack: "← Regresar",
      sortBy: "Ordenar:",
      noResults: "No hay noticias relacionadas con esta búsqueda.",
      readMore: "Leer más",
      titleAsc: "Título A-Z",
      titleDesc: "Título Z-A",
    },
    en: {
      resultsFor: "Results for",
      goBack: "← Go back",
      sortBy: "Sort by:",
      noResults: "No news found for this search.",
      readMore: "Read more",
      titleAsc: "Title A-Z",
      titleDesc: "Title Z-A",
    },
  };

  const tr = useMemo(() => {
    const lang = language === "EN" ? "en" : "es";
    return t[lang];
  }, [language]);

  // Diccionario de palabras clave bilingüe
  const keywordMap: Record<string, string[]> = {
    economy: ["economía"],
    economía: ["economy"],
    market: ["mercado", "mercados"],
    mercado: ["market", "markets"],
    spain: ["espana", "españa"],
    españa: ["spain", "espana"],
  };

  // Sincronizar keyword desde URL
  useEffect(() => {
    if (keywordFromUrl && keywordFromUrl !== keyword) {
      setKeyword(keywordFromUrl);
    }
  }, [keywordFromUrl, keyword, setKeyword]);

  // Limpieza de texto según idioma (quita Title/Subtitulo)
  const cleanText = (text = "") => {
    if (!text) return "";
    let cleaned = text.replace(/\*\*/g, "").trim();
    if (language === "EN") {
      cleaned = cleaned.replace(/Title:/gi, "").replace(/Subtitle:/gi, "").replace(/Date:/gi, "");
    } else {
      cleaned = cleaned.replace(/Título:/gi, "").replace(/Subtítulo:/gi, "").replace(/Fecha:/gi, "");
    }
    return cleaned.trim();
  };

  // Formateo de fecha
  const formatDate = (iso: string) => {
    const date = new Date(iso);
    if (isNaN(date.getTime())) return "";
    return date.toLocaleDateString(
      language === "EN" ? "en-US" : "es-ES",
      { day: "2-digit", month: "short", year: "numeric" }
    );
  };

  /* =========================
     FILTRADO Y ORDENAMIENTO
  ========================= */
  const results = useMemo(() => {
    const all = [...articles];

    // Filtrar por keyword
    let filtered = all;
    if (keyword.trim()) {
      const q = keyword.toLowerCase();
      const keywordsToSearch = [q, ...(keywordMap[q] ?? [])];

      filtered = all.filter(a => {
        const text = `${a.title} ${a.subtitle ?? ""} ${a.body}`.toLowerCase();
        return keywordsToSearch.some(k => text.includes(k));
      });
    }

    // Ordenar por título
    if (sortBy === "title-asc") {
      filtered.sort((a, b) => cleanText(a.title).localeCompare(cleanText(b.title)));
    } else {
      filtered.sort((a, b) => cleanText(b.title).localeCompare(cleanText(a.title)));
    }

    return filtered;
  }, [keyword, articles, sortBy, language]);

  // Navegación al artículo completo en SectionPage
  const handleReadMore = (article: Contenido) => {
    setDateFilter(article.date);
    router.push(`/secciones/${article.section}`);
  };

  const handleGoBack = () => {
    setKeyword("");
    router.back();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 text-[#0a1b2e] space-y-8">

      {/* HEADER */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">
          {tr.resultsFor} “{keyword || keywordFromUrl}”
        </h1>
        <button
          onClick={handleGoBack}
          className="text-[#ff6f61] hover:underline font-medium"
        >
          {tr.goBack}
        </button>
      </div>

      {/* ORDENAR */}
      <div className="flex items-center space-x-2">
        <span className="font-medium">{tr.sortBy}</span>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as SortOption)}
          className="border border-gray-300 rounded px-2 py-1"
        >
          <option value="title-asc">{tr.titleAsc}</option>
          <option value="title-desc">{tr.titleDesc}</option>
        </select>
      </div>

      {/* RESULTADOS */}
      {results.length === 0 ? (
        <p className="text-[#6c7a89] text-lg mt-4">{tr.noResults}</p>
      ) : (
        <AnimatePresence>
          <div className="space-y-6 mt-4">
            {results.map(article => (
              <motion.div
                key={article.url}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 15 }}
                className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow duration-200"
              >
                {/* IMAGEN PRINCIPAL */}
                {article.imageUrl && (
                  <img
                    src={article.imageUrl}
                    alt={cleanText(article.title)}
                    className="w-full h-48 object-cover rounded-lg mb-3"
                  />
                )}

                {/* TÍTULO */}
                <h2 className="text-xl font-semibold text-[#0a1b2e]">
                  {cleanText(article.title)}
                </h2>

                {/* FECHA */}
                {formatDate(article.date) && (
                  <p className="text-sm text-[#6c7a89] mt-1">
                    {formatDate(article.date)}
                  </p>
                )}

                {/* SUBTÍTULO */}
                {article.subtitle && (
                  <p className="text-[#6c7a89] mt-2">{cleanText(article.subtitle)}</p>
                )}

                {/* MINI PREVIEW / BULLETS */}
                {article.body && (
                  <ul className="list-disc pl-5 mt-2 text-[#6c7a89]">
                    {article.body.split("\n").slice(0,3).map((line,i) => (
                      <li key={i}>{line}</li>
                    ))}
                  </ul>
                )}

                {/* LEER MÁS */}
                <button
                  onClick={() => handleReadMore(article)}
                  className="mt-3 text-[#ff6f61] font-medium hover:underline"
                >
                  {tr.readMore}
                </button>
              </motion.div>
            ))}
          </div>
        </AnimatePresence>
      )}
    </div>
  );
}
