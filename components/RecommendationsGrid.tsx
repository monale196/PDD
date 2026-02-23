

"use client";

import { useContext, useMemo } from "react";
import { Contenido } from "../context/NewsContext";
import { motion } from "framer-motion";
import Link from "next/link";
import { LanguageContext } from "../app/RootProviders";
import { usePathname } from "next/navigation";

interface RecommendationsGridProps {
  articles: Contenido[];
  currentArticle: Contenido;
}

/* =========================
   UTILIDADES
========================= */
export const dynamic = "force-dynamic";

// Normaliza texto para comparaciones
const normalize = (text = "") =>
  text
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();

// Extrae keywords simples (sin IA pesada)
const extractKeywords = (text = "") => {
  const stopWords = [
    "de","la","el","y","en","a","los","las","un","una","por","para","con",
    "the","and","of","to","in","on","at","is","are"
  ];
  return normalize(text)
    .split(" ")
    .filter(w => w.length > 4 && !stopWords.includes(w));
};

export default function RecommendationsGrid({
  articles,
  currentArticle,
}: RecommendationsGridProps) {
  const { language } = useContext(LanguageContext);
  const pathname = usePathname();

  const titleText = language === "ES" ? "Te puede interesar" : "You may like";

  const recommendations = useMemo(() => {
    if (!articles || articles.length === 0) return [];

    const currentKeywords = extractKeywords(
      `${currentArticle.title} ${currentArticle.subtitle ?? ""} ${currentArticle.body ?? ""}`
    );

    return (
      articles
        // ❌ quitar artículo actual
        .filter(a => a.url !== currentArticle.url)

        // ❌ evitar clones por título
        .filter(a => {
          const similarity =
            normalize(a.title).includes(normalize(currentArticle.title)) ||
            normalize(currentArticle.title).includes(normalize(a.title));
          return !similarity;
        })

        // 🧠 scoring editorial
        .map(a => {
          let score = 0;

          // misma sección
          if (a.section === currentArticle.section) score += 5;

          // keywords
          const articleKeywords = extractKeywords(
            `${a.title} ${a.subtitle ?? ""} ${a.body ?? ""}`
          );

          const matches = articleKeywords.filter(k =>
            currentKeywords.includes(k)
          ).length;

          score += matches * 2;

          // recencia ligera
          const daysOld =
            (Date.now() - new Date(a.date).getTime()) / (1000 * 60 * 60 * 24);
          if (daysOld < 7) score += 1;

          return { ...a, _score: score };
        })

        // ordenar por score
        .sort((a, b) => b._score - a._score)

        // limitar
        .slice(0, 4)
    );
  }, [articles, currentArticle]);

  if (recommendations.length === 0) return null;

  return (
    <div className="mt-16">
      <h2 className="text-2xl md:text-3xl mb-6 text-center text-[var(--color-foreground)] font-bold">
        {titleText}
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {recommendations.map((a, i) => {
          const cleanTitle = a.title.replace(/^\**\s*(Título|Title):\**\s*/i, "").replace(/\*/g, "");
          const cleanSubtitle = a.subtitle
            ?.replace(/^\**\s*(Subtítulo|Subtitle):\**\s*/i, "")
            .replace(/\*/g, "");

          const preview =
            a.body?.split("\n").filter(l => l.trim()).slice(0, 2).join(" ") || "";

          return (
            <motion.div
              key={a.url}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              whileHover={{
                scale: 1.03,
                boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
              }}
              className="bg-[var(--color-card)] rounded-xl p-4 shadow-sm border border-transparent hover:border-[var(--color-accent)] transition"
            >
              {/* Imagen */}
              {a.imageUrl && (
                <img
                  src={a.imageUrl}
                  alt={cleanTitle}
                  className="w-full h-32 object-cover rounded-md mb-3"
                />
              )}

              {/* Título */}
              <h3 className="font-semibold text-sm md:text-base line-clamp-2 text-[var(--color-foreground)]">
                {cleanTitle}
              </h3>

              {/* Subtítulo */}
              {cleanSubtitle && (
                <p className="text-xs text-[var(--color-gray)] line-clamp-2 mt-1">
                  {cleanSubtitle}
                </p>
              )}

              {/* Preview */}
              {preview && (
                <p className="text-xs text-[var(--color-gray)] line-clamp-2 mt-1">
                  {preview}
                </p>
              )}

              {/* CTA */}
              <div className="mt-3">
                <Link
                  href={`/secciones/${a.section.toLowerCase()}?article=${a.url}&from=${pathname}`}
                  className="inline-block px-4 py-1.5 text-xs bg-[var(--color-accent)] text-white rounded-full hover:opacity-90 transition"
                >
                  {language === "ES" ? "Leer más" : "Read more"}
                </Link>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
