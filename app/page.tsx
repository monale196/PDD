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
    { slug: "economia", nameES: "Economía", nameEN: "Economy" },
    { slug: "empleo", nameES: "Empleo", nameEN: "Employment" },
    { slug: "educacion", nameES: "Educación", nameEN: "Education" },
    { slug: "medio_ambiente", nameES: "Medio Ambiente", nameEN: "Environment" },
    { slug: "tecnologia", nameES: "Tecnología", nameEN: "Technology" },
    { slug: "derechos_democracia", nameES: "Derechos y Democracia", nameEN: "Rights & Democracy" },
    { slug: "futuro", nameES: "Futuro", nameEN: "Future" },
  ];

  // Obtener el artículo más reciente por sección
  const sectionArticles = useMemo(() => {
    const result: Record<string, Contenido | null> = {};

    sections.forEach((section) => {
      const filtered = articles
        .filter((a) => a.section === section.slug)
        .sort(
          (a, b) =>
            new Date(b.date).getTime() - new Date(a.date).getTime()
        );

      result[section.slug] = filtered[0] || null;
    });

    return result;
  }, [articles]);

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-[60vh] text-gray-500">
        Cargando noticias...
      </div>
    );

  return (
    <div className="bg-[#f5f7fa] min-h-screen px-4 md:px-16 py-12">
      <h1 className="text-3xl md:text-4xl font-bold mb-12 text-[#0f172a]">
        {language === "ES" ? "Últimas Noticias" : "Latest News"}
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {sections.map((section) => {
          const article = sectionArticles[section.slug];
          if (!article) return null;

          const title =
            article.title?.replace(/\*\*Título:\*\*/gi, "").trim() ||
            "Sin título";

          const description =
            article.subtitle
              ?.replace(/\*\*Subtítulo:\*\*/gi, "")
              .trim()
              .slice(0, 120) + "..." || "";

          const image =
            article.imageUrl ||
            "https://via.placeholder.com/600x400?text=No+Image";

          return (
            <motion.div
              key={section.slug}
              whileHover={{ scale: 1.03 }}
              className="bg-white rounded-2xl shadow-lg overflow-hidden transition"
            >
              <Link
                href={`/secciones/${article.section}?article=${article.url}`}
                className="block"
              >
                {/* Imagen */}
                <div className="w-full h-56 overflow-hidden">
                  <img
                    src={image}
                    alt={title}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Contenido */}
                <div className="p-6 flex flex-col justify-between h-60">
                  <div>
                    <span className="text-sm font-semibold text-[#1e3a8a]">
                      {language === "ES"
                        ? section.nameES
                        : section.nameEN}
                    </span>

                    <h2 className="mt-2 text-xl font-bold text-[#0f172a] leading-snug">
                      {title}
                    </h2>

                    <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                      {description}
                    </p>
                  </div>

                  <div className="mt-4">
                    <span className="inline-block px-4 py-2 bg-[#1e3a8a] text-white text-sm rounded-full font-medium hover:bg-[#163172] transition">
                      {language === "ES"
                        ? "Descubrir más"
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
  );
}
