"use client";

import { useContext } from "react";
import { Contenido } from "../context/NewsContext";
import { motion } from "framer-motion";
import Link from "next/link";
import { LanguageContext } from "../app/RootProviders";
import { usePathname } from "next/navigation";

interface RecommendationsGridProps {
  articles: Contenido[];
  currentSection?: string;
}

export default function RecommendationsGrid({
  articles,
  currentSection,
}: RecommendationsGridProps) {
  const { language } = useContext(LanguageContext);
  const pathname = usePathname();

  if (!articles || articles.length === 0) return null;

  const titles = {
    ES: "Te puede interesar",
    EN: "You may like",
  };

  const titleRegex = /^\**\s*(Título|Title):\**\s*/i;
  const subtitleRegex = /^\**\s*(Subtítulo|Subtitle):\**\s*/i;

  return (
    <div className="mt-12">
      <h2 className="text-2xl md:text-3xl mb-6 text-[var(--color-foreground)] text-center">
        {titles[language]}
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {articles.map((a, i) => {
          const cleanTitle = a.title.replace(titleRegex, "").replace(/\*/g, "").trim();
          const cleanSubtitle = a.subtitle.replace(subtitleRegex, "").replace(/\*/g, "").trim();
          const miniBody = a.body?.split("\n").filter(l => l.trim() !== "").slice(0, 2).join(" ") || "";

          let formattedDate = "";
          try {
            const d = new Date(a.date);
            if (!isNaN(d.getTime())) {
              formattedDate = `${String(d.getDate()).padStart(2, "0")}/${String(
                d.getMonth() + 1
              ).padStart(2, "0")}/${String(d.getFullYear()).slice(-2)}`;
            }
          } catch {
            formattedDate = a.date || "";
          }

          return (
            <motion.div
              key={a.url + i}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{
                scale: 1.03,
                y: -3,
                boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
              }}
              transition={{
                delay: i * 0.05,
                type: "spring",
                stiffness: 120,
                damping: 12,
              }}
              className="bg-[var(--color-card)] rounded-xl cursor-pointer flex flex-col gap-2 p-3 shadow-sm border border-transparent hover:border-[var(--color-accent)] transition"
            >
              {/* Imagen miniatura */}
              {a.imageUrl && (
                <img
                  src={a.imageUrl}
                  alt={cleanTitle}
                  className="w-full h-28 object-cover rounded-md mb-2"
                />
              )}

              {/* Título */}
              <h3 className="text-sm md:text-base font-medium text-[var(--color-foreground)] line-clamp-2">
                {cleanTitle}
              </h3>

              {/* Subtítulo */}
              {cleanSubtitle && (
                <p className="text-xs md:text-sm text-[var(--color-gray)] line-clamp-2">
                  {cleanSubtitle}
                </p>
              )}

              {/* Mini cuerpo */}
              {miniBody && (
                <p className="text-xs text-[var(--color-gray)] line-clamp-2">{miniBody}</p>
              )}

              {/* Fecha */}
              {formattedDate && (
                <p className="text-[var(--color-gray)] text-xs">{formattedDate}</p>
              )}

              {/* Leer más */}
              <div className="mt-1">
                <Link
                  href={`/secciones/${a.section.toLowerCase()}?article=${a.url}&from=${pathname}`}
                  className="inline-block px-3 py-1 text-xs bg-[var(--color-accent)] text-white rounded-md hover:opacity-90 transition"
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
