"use client";

import { useContext, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { NewsContext } from "../context/NewsContext";
import { LanguageContext, SearchContext } from "./RootProviders";

export default function Home() {
  const { language } = useContext(LanguageContext);
  const { dateFilter } = useContext(SearchContext); // ← 🔹 Fecha seleccionada en Header
  const { articles, mainArticlesBySection, loading, loadArticles } = useContext(NewsContext);

  // 🔹 Dispara recarga cuando cambia la fecha en el Header (sin tocar Header)
  useEffect(() => {
    // Si hay dateFilter, pedimos al NewsContext cargar artículos de esa fecha.
    // Firma deducida de tu Header/Context: loadArticles(undefined, undefined, date?, "all")
    if (typeof loadArticles === "function") {
      loadArticles(undefined, undefined, dateFilter || undefined, "all");
    }
  }, [dateFilter, loadArticles]);

  // 🔹 Mapa de traducción de secciones
  const sectionNames: Record<string, { es: string; en: string; color: string }> = {
    economia: { es: "Economía", en: "Economy", color: "bg-[#0a3d62]" },
    empleo: { es: "Empleo", en: "Employment", color: "bg-[#165788]" },
    educacion: { es: "Educación", en: "Education", color: "bg-[#107896]" },
    medio_ambiente: { es: "Medio ambiente", en: "Environment", color: "bg-[#0b7285]" },
    tecnologia: { es: "Tecnología", en: "Technology", color: "bg-[#0d9488]" },
    derechos_democracia: { es: "Derechos y democracia", en: "Rights & Democracy", color: "bg-[#14b8a6]" },
    opinion: { es: "Opinión", en: "Opinion", color: "bg-[#f97316]" },
    empresa: { es: "Empresa", en: "Business", color: "bg-[#059669]" },
    sociedad: { es: "Sociedad", en: "Society", color: "bg-[#8b5cf6]" },
    futuro: { es: "Futuro", en: "Future", color: "bg-[#0d6efd]" },
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return `${d.getDate().toString().padStart(2, "0")} ${d
      .toLocaleString(language === "ES" ? "es-ES" : "en-US", { month: "short" })
      .toUpperCase()} ${d.getFullYear().toString().slice(-2)}`;
  };

  const cleanText = (text?: string) =>
    text
      ?.replace(/^(\*?\s*)?(Título|Title):/i, "")
      .replace(/^(\*?\s*)?(Subtítulo|Subtitle):/i, "")
      .trim() || "";

  // ==============================
  // 🔹 Normalización de fechas (sin problemas de zona horaria)
  // ==============================

  // Convierte Date a "YYYY-MM-DD" en zona local (sin saltos de día por UTC)
  const toLocalDateKey = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
    // ¡No usamos toISOString() porque convierte a UTC y puede restar/sumar un día!
  };

  // Intenta obtener "YYYY-MM-DD" del artículo, soportando:
  // - ISO completo ("2026-02-23T10:20:30Z" → "2026-02-23")
  // - "YYYY-MM-DD"
  // - "DD/MM/YYYY"
  const getArticleDateKey = (raw?: string): string => {
    if (!raw) return "";
    // Si ya es YYYY-MM-DD
    const ymd = raw.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (ymd) return `${ymd[1]}-${ymd[2]}-${ymd[3]}`;

    // DD/MM/YYYY
    const dmy = raw.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (dmy) {
      const [_, dd, mm, yyyy] = dmy;
      return `${yyyy}-${mm}-${dd}`;
    }

    // Como último recurso, parsear y convertir a local key
    const d = new Date(raw);
    if (!isNaN(d.getTime())) return toLocalDateKey(d);

    return "";
  };

  // 🔹 Secciones únicas a partir de los artículos
  const uniqueSections = useMemo(() => {
    const slugs = Array.from(new Set(articles.map((a) => a.section)));
    return slugs
      .map((slug) => {
        const info = sectionNames[slug];
        if (!info) return null;
        return { slug, ...info };
      })
      .filter(Boolean) as { slug: string; es: string; en: string; color: string }[];
  }, [articles]);

  // ==============================
  // 🔹 Filtrado por fecha (fallback local si el servidor no filtró)
  // ==============================
  const filteredArticles = useMemo(() => {
    if (!dateFilter) return articles;
    const wanted = dateFilter; // "YYYY-MM-DD" (viene del Header)
    const result = articles.filter((a) => getArticleDateKey(a?.date) === wanted);
    return result;
  }, [articles, dateFilter]);

  // ==============================
  // 🔹 Selección por sección con fallback SIEMPRE (nunca vacío)
  // - Si hay filtro de fecha:
  //   • Se intenta el del día.
  //   • Si no hay, cae al principal de la sección (mainArticlesBySection[slug]).
  // - Si NO hay filtro:
  //   • Se usa el principal como siempre.
  // ==============================
  const sectionArticles = useMemo(() => {
    if (!uniqueSections.length) return [];
    if (dateFilter) {
      return uniqueSections
        .map((sec) => {
          const ofDay = filteredArticles.find((a) => a.section === sec.slug);
          return ofDay || mainArticlesBySection[sec.slug];
        })
        .filter(Boolean) as typeof articles;
    }
    // sin filtro: como antes, usamos los mainArticlesBySection
    return uniqueSections
      .map((sec) => mainArticlesBySection[sec.slug])
      .filter(Boolean) as typeof articles;
  }, [filteredArticles, mainArticlesBySection, uniqueSections, dateFilter]);

  // ==============================
  // 🔹 Otros artículos con fallback SIEMPRE (nunca vacío si hay artículos)
  // - Si hay filtro y el set filtrado está vacío, cae a los artículos actuales.
  // ==============================
  const otherArticles = useMemo(() => {
    const usedUrls = new Set(sectionArticles.map((a) => a.url));
    const pool =
      dateFilter && filteredArticles.length > 0 ? filteredArticles : articles;
    return pool.filter((a) => !usedUrls.has(a.url)).slice(0, 2);
  }, [articles, filteredArticles, sectionArticles, dateFilter]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh] text-gray-500">
        {language === "ES" ? "Cargando noticias..." : "Loading news..."}
      </div>
    );
  }

  // Texto auxiliar bajo el título cuando hay filtro de fecha activo
  const dateBadge =
    dateFilter &&
    new Date(dateFilter).toLocaleDateString(
      language === "ES" ? "es-ES" : "en-GB",
      { day: "2-digit", month: "long", year: "numeric" }
    );

  // 🚫 IMPORTANTE: Eliminamos cualquier mensaje de "No hay noticias"
  // Siempre mostramos contenido gracias a los fallbacks por sección/otros.

  return (
    <div className="bg-[var(--color-background)] min-h-screen px-4 md:px-16 py-12">
      <h1 className="text-3xl md:text-4xl font-bold text-[var(--color-foreground)]">
        {language === "ES" ? "Últimas Noticias" : "Latest News"}
      </h1>

      {dateFilter && (
        <p className="mt-2 text-sm text-[var(--color-gray)]">
          {language === "ES" ? "Filtrado por fecha: " : "Filtered by date: "}
          <span className="font-semibold">{dateBadge}</span>
        </p>
      )}

      {/* ================= Secciones principales ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8 mb-12">
        {sectionArticles.map((article) => {
          const section = uniqueSections.find((s) => s.slug === article.section);
          if (!section) return null;

          const title = cleanText(article.title) || "Sin título";
          const description = cleanText(article.subtitle);
          const image =
            article.imageUrl || "https://via.placeholder.com/600x400?text=No+Image";
          const date = article.date ? formatDate(article.date) : "";

          const href = `/secciones/${article.section}`; // 🚀 sin idioma

          return (
            <motion.div
              key={article.url}
              whileHover={{ scale: 1.03 }}
              className="bg-[var(--color-card)] rounded-2xl shadow-lg overflow-hidden flex flex-col transition"
            >
              <div
                className={`flex justify-between items-center px-4 py-2 ${section.color} text-white font-medium rounded-t-2xl`}
              >
                <span>{language === "ES" ? section.es : section.en}</span>
                <span className="text-xs">{date}</span>
              </div>

              <div className="w-full h-56 overflow-hidden">
                <img src={image} alt={title} className="w-full h-full object-cover" />
              </div>

              <div className="p-6 flex flex-col flex-1">
                <h2 className="text-xl font-bold text-[var(--color-foreground)] leading-snug">
                  {title}
                </h2>
                <p className="mt-2 text-sm text-[var(--color-gray)] line-clamp-3 flex-1">
                  {description}
                </p>

                <div className="mt-4 flex justify-end">
                  <Link href={href}>
                    <span
                      className={`inline-block px-4 py-2 rounded-full text-white text-sm font-medium ${section.color} hover:opacity-90 transition`}
                    >
                      {language === "ES" ? "Leer más" : "Discover more"}
                    </span>
                  </Link>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* ================= Otros artículos ================= */}
      {otherArticles.length > 0 && (
        <div className="mt-16">
          <h2 className="text-2xl md:text-3xl font-bold mb-6 text-[var(--color-foreground)]">
            {language === "ES"
              ? "Para entender mejor el mundo"
              : "To better understand the world"}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
            {otherArticles.map((article) => {
              const title = cleanText(article.title) || "Sin título";
              const description =
                cleanText(article.subtitle).split("\n").slice(0, 3).join(" ") || "";
              const image =
                article.imageUrl || "https://via.placeholder.com/600x400?text=No+Image";
              const date = article.date ? formatDate(article.date) : "";

              const href = `/secciones/${article.section}`; // 🚀 sin idioma

              return (
                <motion.div
                  key={article.url}
                  whileHover={{ scale: 1.02 }}
                  className="bg-[var(--color-card)] rounded-2xl shadow-md overflow-hidden flex flex-col transition"
                >
                  <Link href={href} className="flex flex-col flex-1">
                    <div className="w-full h-40 overflow-hidden">
                      <img src={image} alt={title} className="w-full h-full object-cover" />
                    </div>

                    <div className="p-4 flex flex-col flex-1 justify-between min-h-[300px]">
                      <h3 className="text-lg font-semibold text-[var(--color-foreground)] leading-snug">
                        {title}
                      </h3>
                      <p className="mt-1 text-sm text-[var(--color-gray)] line-clamp-3">
                        {description}
                      </p>

                      <div className="mt-2 flex justify-end">
                        <span className="inline-block px-3 py-1 rounded-full bg-[var(--color-accent)] text-white text-sm font-medium hover:opacity-90 transition">
                          {language === "ES" ? "Leer más" : "Discover more"}
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