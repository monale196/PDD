"use client";
export const dynamic = "force-dynamic";

import { useContext, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

import { NewsContext } from "../context/NewsContext";
import { LanguageContext } from "./RootProviders";
import { SearchContext } from "@/context/SearchContext";

export default function Home() {
  const { language } = useContext(LanguageContext);
  const { dateFilter } = useContext(SearchContext);

  const {
    articles,
    mainArticlesBySection,
    loading,
    loadArticles,
  } = useContext(NewsContext);

  /* ✅ CLAVE: recargar noticias cuando cambia la fecha */
  useEffect(() => {
    if (dateFilter) {
      loadArticles(dateFilter);
    }
  }, [dateFilter, loadArticles]);

  /* ───────── MAPA DE SECCIONES ───────── */
  const sectionNames: Record<
    string,
    { es: string; en: string; color: string }
  > = {
    economia: { es: "Economía", en: "Economy", color: "bg-[#0a3d62]" },
    empleo: { es: "Empleo", en: "Employment", color: "bg-[#165788]" },
    educacion: { es: "Educación", en: "Education", color: "bg-[#107896]" },
    medio_ambiente: {
      es: "Medio ambiente",
      en: "Environment",
      color: "bg-[#0b7285]",
    },
    tecnologia: {
      es: "Tecnología",
      en: "Technology",
      color: "bg-[#0d9488]",
    },
    derechos_democracia: {
      es: "Derechos y democracia",
      en: "Rights & Democracy",
      color: "bg-[#14b8a6]",
    },
    opinion: {
      es: "Opinión",
      en: "Opinion",
      color: "bg-[#f97316]",
    },
    empresa: {
      es: "Empresa",
      en: "Business",
      color: "bg-[#059669]",
    },
    sociedad: {
      es: "Sociedad",
      en: "Society",
      color: "bg-[#8b5cf6]",
    },
    futuro: {
      es: "Futuro",
      en: "Future",
      color: "bg-[#0d6efd]",
    },
  };

  /* ───────── UTILIDADES ───────── */
  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return `${d
      .getDate()
      .toString()
      .padStart(2, "0")} ${d
      .toLocaleString(
        language === "ES" ? "es-ES" : "en-US",
        { month: "short" }
      )
      .toUpperCase()} ${d.getFullYear().toString().slice(-2)}`;
  };

  const cleanText = (text?: string) =>
    text
      ?.replace(/^(\*?\s*)?(Título|Title):/i, "")
      .replace(/^(\*?\s*)?(Subtítulo|Subtitle):/i, "")
      .trim() || "";

  /* ───────── SECCIONES ÚNICAS ───────── */
  const uniqueSections = useMemo(() => {
    const slugs = Array.from(new Set(articles.map(a => a.section)));
    return slugs
      .map(slug => {
        const info = sectionNames[slug];
        if (!info) return null;
        return { slug, ...info };
      })
      .filter(Boolean) as {
      slug: string;
      es: string;
      en: string;
      color: string;
    }[];
  }, [articles]);

  /* ───────── ARTÍCULOS PRINCIPALES ───────── */
  const sectionArticles = useMemo(() => {
    return uniqueSections
      .map(sec => mainArticlesBySection[sec.slug])
      .filter(Boolean) as typeof articles;
  }, [mainArticlesBySection, uniqueSections]);

  /* ───────── OTROS ARTÍCULOS ───────── */
  const otherArticles = useMemo(() => {
    const usedUrls = new Set(sectionArticles.map(a => a.url));
    return articles.filter(a => !usedUrls.has(a.url)).slice(0, 2);
  }, [articles, sectionArticles]);

  /* ───────── LOADING ───────── */
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh] text-gray-500">
        {language === "ES"
          ? "Cargando noticias..."
          : "Loading news..."}
      </div>
    );
  }

  /* ───────── RENDER ───────── */
  return (
    <div className="bg-[var(--color-background)] min-h-screen px-4 md:px-16 py-12">
      <h1 className="text-3xl md:text-4xl font-bold mb-12 text-[var(--color-foreground)]">
        {language === "ES" ? "Últimas Noticias" : "Latest News"}
      </h1>

      {/* ───────── Secciones principales ───────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {sectionArticles.map(article => {
          const section = uniqueSections.find(
            s => s.slug === article.section
          );
          if (!section) return null;

          const title = cleanText(article.title) || "Sin título";
          const description = cleanText(article.subtitle);
          const image =
            article.imageUrl ||
            "https://via.placeholder.com/600x400?text=No+Image";
          const date = article.date ? formatDate(article.date) : "";

          const href = `/secciones/${article.section}`;

          return (
            <motion.div
              key={article.url}
              whileHover={{ scale: 1.03 }}
              className="bg-[var(--color-card)] rounded-2xl shadow-lg overflow-hidden flex flex-col transition"
            >
              <div
                className={`flex justify-between items-center px-4 py-2 ${section.color} text-white font-medium rounded-t-2xl`}
              >
                <span>
                  {language === "ES" ? section.es : section.en}
                </span>
                <span className="text-xs">{date}</span>
              </div>

              <div className="w-full h-56 overflow-hidden">
                <img
                  src={image}
                  alt={title}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="p-6 flex flex-col flex-1">
                <h2 className="text-xl font-bold leading-snug">
                  {title}
                </h2>
                <p className="mt-2 text-sm text-gray-600 line-clamp-3 flex-1">
                  {description}
                </p>

                <div className="mt-4 flex justify-end">
                  <Link href={href}>
                    <span
                      className={`inline-block px-4 py-2 rounded-full text-white text-sm font-medium ${section.color} hover:opacity-90 transition`}
                    >
                      {language === "ES"
                        ? "Leer más"
                        : "Discover more"}
                    </span>
                  </Link>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* ───────── Otros artículos ───────── */}
      {otherArticles.length > 0 && (
        <div className="mt-16">
          <h2 className="text-2xl md:text-3xl font-bold mb-6">
            {language === "ES"
              ? "Para entender mejor el mundo"
              : "To better understand the world"}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {otherArticles.map(article => {
              const title = cleanText(article.title) || "Sin título";
              const description =
                cleanText(article.subtitle)
                  .split("\n")
                  .slice(0, 3)
                  .join(" ") || "";
              const image =
                article.imageUrl ||
                "https://via.placeholder.com/600x400?text=No+Image";

              const href = `/secciones/${article.section}`;

              return (
                <motion.div
                  key={article.url}
                  whileHover={{ scale: 1.02 }}
                  className="bg-[var(--color-card)] rounded-2xl shadow-md overflow-hidden transition"
                >
                  <Link href={href} className="flex flex-col h-full">
                    <div className="w-full h-40 overflow-hidden">
                      <img
                        src={image}
                        alt={title}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="p-4 flex flex-col flex-1">
                      <h3 className="text-lg font-semibold leading-snug">
                        {title}
                      </h3>
                      <p className="mt-2 text-sm text-gray-600 line-clamp-3">
                        {description}
                      </p>

                      <div className="mt-auto flex justify-end">
                        <span className="inline-block px-3 py-1 rounded-full bg-[var(--color-accent)] text-white text-sm font-medium">
                          {language === "ES"
                            ? "Leer más"
                            : "Discover more"}
                        </span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
