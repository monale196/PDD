"use client";

import { useContext, useMemo } from "react";
import { motion } from "framer-motion";
import { LanguageContext } from "./RootProviders";
import { NewsContext, Contenido } from "../context/NewsContext";
import Link from "next/link";

export default function Home() {
  const { language } = useContext(LanguageContext);
  const { articles, loading } = useContext(NewsContext);

  const sections = [
    { slug: "economia", nameES: "España", nameEN: "Spain", color: "bg-[#0a3d62]" },
    { slug: "empleo", nameES: "Mundo", nameEN: "World", color: "bg-[#165788]" },
    { slug: "educacion", nameES: "Opinión", nameEN: "Opinion", color: "bg-[#107896]" },
    { slug: "medio_ambiente", nameES: "Empresa", nameEN: "Business", color: "bg-[#0b7285]" },
    { slug: "tecnologia", nameES: "Tecnología", nameEN: "Technology", color: "bg-[#0d9488]" },
    { slug: "derechos_democracia", nameES: "Sociedad", nameEN: "Society", color: "bg-[#14b8a6]" },
  ];

  // Primer artículo más reciente por sección
  const sectionArticles = useMemo(() => {
    const result: Record<string, Contenido | null> = {};
    sections.forEach((section) => {
      const filtered = articles
        .filter((a) => a.section === section.slug)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      result[section.slug] = filtered[0] || null;
    });
    return result;
  }, [articles]);

  // 2 artículos random para "Para entender mejor el mundo"
  const worldArticles = useMemo(() => {
    if (!articles.length) return [];
    const shuffled = [...articles].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 2);
  }, [articles]);

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-[60vh] text-gray-500">
        Cargando noticias...
      </div>
    );

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return `${d.getDate().toString().padStart(2, "0")} ${d.toLocaleString("es-ES", { month: "short" }).toUpperCase()} ${d.getFullYear().toString().slice(-2)}`;
  };

  return (
    <div className="bg-[var(--color-background)] min-h-screen px-4 md:px-16 py-12">
      <h1 className="text-3xl md:text-4xl font-bold mb-12 text-[var(--color-foreground)]">
        {language === "ES" ? "Últimas Noticias" : "Latest News"}
      </h1>

      {/* Secciones principales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {sections.map((section) => {
          const article = sectionArticles[section.slug];
          if (!article) return null;

          const title = article.title?.trim() || "Sin título";
          const description = article.subtitle?.trim() || "";
          const image = article.imageUrl || "https://via.placeholder.com/600x400?text=No+Image";
          const date = article.date ? formatDate(article.date) : "";

          return (
            <motion.div
              key={section.slug}
              whileHover={{ scale: 1.03 }}
              className="bg-[var(--color-card)] rounded-2xl shadow-lg overflow-hidden flex flex-col transition"
            >
              {/* Encabezado único: sección a la izquierda + fecha a la derecha */}
              <div className={`flex justify-between items-center px-4 py-2 ${section.color} text-white font-medium rounded-t-2xl`}>
                <span>{language === "ES" ? section.nameES : section.nameEN}</span>
                <span className="text-xs">{date}</span>
              </div>

              {/* Imagen */}
              <div className="w-full h-56 overflow-hidden">
                <img
                  src={image}
                  alt={title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Contenido: título + subtítulo */}
              <div className="p-6 flex flex-col flex-1">
                <h2 className="text-xl font-bold text-[var(--color-foreground)] leading-snug">
                  {title}
                </h2>
                <p className="mt-2 text-sm text-[var(--color-gray)] line-clamp-3 flex-1">
                  {description}
                </p>

                {/* Botón Leer más */}
                <div className="mt-4 flex justify-end">
                  <Link href={`/secciones/${article.section}`}>
                    <span className={`inline-block px-4 py-2 rounded-full text-white text-sm font-medium ${section.color} hover:opacity-90 transition`}>
                      {language === "ES" ? "Leer más" : "Discover more"}
                    </span>
                  </Link>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Bloque "Para entender mejor el mundo" */}
      <div className="mt-16">
        <h2 className="text-2xl md:text-3xl font-bold mb-6 text-[var(--color-foreground)]">
          {language === "ES" ? "Para entender mejor el mundo" : "To better understand the world"}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
          {worldArticles.map((article, i) => {
            const title = article.title?.trim() || "Sin título";
            const description = article.subtitle?.trim().split("\n").slice(0, 3).join(" ") || "";
            const image = article.imageUrl || "https://via.placeholder.com/600x400?text=No+Image";
            const date = article.date ? formatDate(article.date) : "";

            return (
              <motion.div
                key={i}
                whileHover={{ scale: 1.02 }}
                className="bg-[var(--color-card)] rounded-2xl shadow-md overflow-hidden flex flex-col transition"
              >
                <Link href={`/secciones/${article.section}`} className="flex flex-col flex-1">
                  {/* Imagen */}
                  <div className="w-full h-40 overflow-hidden">
                    <img
                      src={image}
                      alt={title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Contenido */}
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
    </div>
  );
}
