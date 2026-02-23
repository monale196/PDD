"use client";

import { useContext, useMemo, useEffect } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { NewsContext, Contenido } from "../../../context/NewsContext";
import ArticleView from "../../../components/ArticleView";
import { SearchContext, LanguageContext } from "../../../app/RootProviders";

export default function SectionPage() {
  const params = useParams();
  const searchParams = useSearchParams();

  // 🔹 Obtiene el slug de la sección desde la URL
  const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug || "";
  const sectionSlug = slug.toLowerCase();

  const { articles, loadArticles, loading } = useContext(NewsContext);
  const { dateFilter } = useContext(SearchContext);
  const { language: languageContext } = useContext(LanguageContext);
  const lang: "ES" | "EN" = languageContext; // 🔹 Usamos el contexto, no la URL
  const langLower = lang.toLowerCase();

  // 🔹 Parámetro opcional para abrir un artículo específico
  const queryArticleSlug = searchParams.get("article");

  /* ============================
     FETCH DE ARTÍCULOS POR SECCIÓN
  ============================ */
  useEffect(() => {
    async function fetchSectionArticles() {
      if (dateFilter) {
        const [year, month, day] = dateFilter.split("-");
        await loadArticles(year, month, day, sectionSlug, langLower);
      } else {
        await loadArticles(undefined, undefined, undefined, sectionSlug, langLower);
      }
    }

    fetchSectionArticles();
  }, [dateFilter, sectionSlug, loadArticles, langLower]); // 🔹 Se vuelve a ejecutar si cambia el idioma

  /* ============================
     SELECCIONA ARTÍCULO PRINCIPAL
  ============================ */
  const mainArticle: Contenido | undefined = useMemo(() => {
    if (loading || articles.length === 0) return undefined;

    // 🔹 Si hay query "article", busca el artículo exacto
    if (queryArticleSlug) {
      return articles.find((a) =>
        a.url.endsWith(`/${queryArticleSlug}`)
      );
    }

    // 🔹 Si hay filtro de fecha, devuelve el primero
    if (dateFilter) {
      return articles[0];
    }

    // 🔹 Sino, devuelve el artículo más reciente
    return articles
      .slice()
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
  }, [articles, queryArticleSlug, dateFilter, loading]);

  /* ============================
     RENDER
  ============================ */
  return (
    <div className="px-4 md:px-16 py-12 space-y-16 max-w-6xl mx-auto">
      {loading && (
        <p className="text-center text-gray-500 text-lg animate-pulse">
          {lang === "ES" ? "Cargando noticias…" : "Loading news…"}
        </p>
      )}

      {!loading && mainArticle && (
        <ArticleView article={mainArticle} language={lang} />
      )}

      {!loading && !mainArticle && (
        <p className="text-center text-gray-500 text-lg">
          {lang === "ES"
            ? "No hay artículos disponibles para esta sección."
            : "No articles available for this section."}
        </p>
      )}
    </div>
  );
}
