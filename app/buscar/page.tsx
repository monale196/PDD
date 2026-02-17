"use client";

import { useContext, useEffect, useMemo } from "react";
import { useSearchParams, usePathname } from "next/navigation";
import { LanguageContext, SearchContext } from "../RootProviders";
import { NewsContext, Contenido } from "../../context/NewsContext";
import RecommendationsGrid from "../../components/RecommendationsGrid";
import { motion } from "framer-motion";
import CookieBanner from "../../components/CookieBanner";
import { Merriweather } from "next/font/google";

const merriweather = Merriweather({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-merriweather",
});

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export default function BuscarPage() {
  const { language } = useContext(LanguageContext);
  const { keyword, setKeyword } = useContext(SearchContext);
  const { articles, loading } = useContext(NewsContext);
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const keywordFromUrl = searchParams.get("keyword") || "";

  // Sincronizar keyword con la URL
  useEffect(() => {
    if (keywordFromUrl !== keyword) setKeyword(keywordFromUrl);
  }, [keywordFromUrl, keyword, setKeyword]);

  // Filtrar artículos según keyword
  const filteredArticles: Contenido[] = useMemo(() => {
    if (!keyword) return [];
    const k = keyword.toLowerCase();
    return articles.filter(
      (a) =>
        a.title.toLowerCase().includes(k) ||
        a.subtitle.toLowerCase().includes(k) ||
        a.body.toLowerCase().includes(k)
    );
  }, [articles, keyword]);

  return (
    <div
      className={`${merriweather.variable} flex flex-col min-h-screen bg-white text-[#0a1b2e]`}
    >
      <main className="flex-1 px-4 md:px-16 py-10 space-y-12 max-w-5xl mx-auto">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-3xl md:text-4xl font-bold mb-6 text-center"
        >
          {language === "ES"
            ? `Resultados de búsqueda para: "${keyword}"`
            : `Search results for: "${keyword}"`}
        </motion.h1>

        {loading && (
          <p className="text-center text-gray-500 animate-pulse">
            {language === "ES" ? "Cargando artículos…" : "Loading articles…"}
          </p>
        )}

        {!loading && filteredArticles.length === 0 && (
          <p className="text-center text-gray-500">
            {language === "ES"
              ? "No se encontraron artículos."
              : "No articles found."}
          </p>
        )}

        {!loading && filteredArticles.length > 0 && (
          <RecommendationsGrid
            articles={filteredArticles}
            currentSection=""
          />
        )}
      </main>

      <CookieBanner language={language} />
    </div>
  );
}
