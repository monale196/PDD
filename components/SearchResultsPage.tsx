"use client";

import { useContext, useMemo, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

import { NewsContext, Contenido } from "@/context/NewsContext";
import { SearchContext } from "@/context/SearchContext";
import { LanguageContext } from "@/app/RootProviders";

type SortOption = "title-asc" | "title-desc";

export default function SearchResultsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  /* ========= CONTEXT ========= */
  const { articles } = useContext(NewsContext);
  const { setKeyword, setDateFilter } = useContext(SearchContext);
  const { language } = useContext(LanguageContext);

  /* ========= KEYWORD DESDE URL (FUENTE DE LA VERDAD) ========= */
  const keywordFromUrl = searchParams.get("keyword") || "";

  /* ========= STATE ========= */
  const [localKeyword, setLocalKeyword] = useState(keywordFromUrl);
  const [sortBy, setSortBy] = useState<SortOption>("title-asc");

  /* ========= SYNC INPUT CON URL ========= */
  useEffect(() => {
    setLocalKeyword(keywordFromUrl);
    setKeyword(keywordFromUrl);
  }, [keywordFromUrl, setKeyword]);

  /* ========= TRADUCCIONES ========= */
  const t = {
    es: {
      resultsFor: "Resultados para",
      resultsAll: "todos los artículos",
      goBack: "← Volver",
      sortBy: "Ordenar por:",
      noResults: "No se encontraron artículos relacionados.",
      readMore: "Leer artículo",
      titleAsc: "Título A–Z",
      titleDesc: "Título Z–A",
      searchPlaceholder: "Buscar noticias…",
      searchButton: "Buscar",
    },
    en: {
      resultsFor: "Results for",
      resultsAll: "all articles",
      goBack: "← Go back",
      sortBy: "Sort by:",
      noResults: "No related articles found.",
      readMore: "Read article",
      titleAsc: "Title A–Z",
      titleDesc: "Title Z–A",
      searchPlaceholder: "Search news…",
      searchButton: "Search",
    },
  };

  const tr = language === "EN" ? t.en : t.es;

  /* ========= PROTECCIÓN ========= */
  if (!articles) return null;

  /* ========= UTILIDADES ========= */
  const cleanText = (text = "") =>
    text
      .replace(/\*\*/g, "")
      .replace(/(Título|Title|Subtítulo|Subtitle|Fecha|Date):/gi, "")
      .trim();

  const formatDate = (iso: string) => {
    const date = new Date(iso);
    if (isNaN(date.getTime())) return "";
    return date.toLocaleDateString(
      language === "EN" ? "en-GB" : "es-ES",
      { day: "2-digit", month: "short", year: "numeric" }
    );
  };

  /* ========= FILTRADO ========= */
  const results = useMemo(() => {
    let filtered = [...articles];

    const q = keywordFromUrl.trim().toLowerCase();
    if (q) {
      filtered = filtered.filter(a =>
        `${a.title} ${a.subtitle ?? ""} ${a.body ?? ""}`
          .toLowerCase()
          .includes(q)
      );
    }

    filtered.sort((a, b) =>
      sortBy === "title-asc"
        ? cleanText(a.title).localeCompare(cleanText(b.title))
        : cleanText(b.title).localeCompare(cleanText(a.title))
    );

    return filtered;
  }, [articles, keywordFromUrl, sortBy]);

  /* ========= ACCIONES ========= */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = localKeyword.trim();
    router.push(`/buscar?keyword=${encodeURIComponent(q)}`);
  };

  const handleReadMore = (article: Contenido) => {
    setDateFilter(article.date);
    router.push(`/secciones/${article.section}`);
  };

  const handleGoBack = () => router.back();

  /* ========= RENDER ========= */
  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-8">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-2xl font-bold">
          {tr.resultsFor}{" "}
          {keywordFromUrl
            ? `“${keywordFromUrl}”`
            : tr.resultsAll}
        </h1>

        <button
          onClick={handleGoBack}
          className="text-[var(--color-accent)] font-medium hover:underline"
        >
          {tr.goBack}
        </button>
      </div>

      {/* BUSCADOR */}
      <form
        onSubmit={handleSubmit}
        className="flex flex-col md:flex-row gap-4"
      >
        <input
          value={localKeyword}
          onChange={(e) => setLocalKeyword(e.target.value)}
          placeholder={tr.searchPlaceholder}
          className="flex-1 px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
        />
        <button
          type="submit"
          className="px-6 py-3 rounded-xl bg-[var(--color-accent)] text-white font-semibold hover:opacity-90 transition"
        >
          {tr.searchButton}
        </button>
      </form>

      {/* ORDENAR */}
      <div className="flex items-center gap-2">
        <span className="font-medium">{tr.sortBy}</span>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as SortOption)}
          className="border border-gray-300 rounded-lg px-3 py-2"
        >
          <option value="title-asc">{tr.titleAsc}</option>
          <option value="title-desc">{tr.titleDesc}</option>
        </select>
      </div>

      {/* RESULTADOS */}
      {results.length === 0 ? (
        <p className="text-gray-500 text-lg">{tr.noResults}</p>
      ) : (
        <AnimatePresence>
          <div className="space-y-6">
            {results.map(article => (
              <motion.div
                key={article.url}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 12 }}
                className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition"
              >
                <h2 className="text-xl font-semibold">
                  {cleanText(article.title)}
                </h2>

                {article.subtitle && (
                  <p className="text-gray-600 mt-2">
                    {cleanText(article.subtitle)}
                  </p>
                )}

                {formatDate(article.date) && (
                  <p className="text-sm text-gray-500 mt-1">
                    {formatDate(article.date)}
                  </p>
                )}

                <button
                  onClick={() => handleReadMore(article)}
                  className="mt-4 inline-block text-[var(--color-accent)] font-semibold hover:underline"
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