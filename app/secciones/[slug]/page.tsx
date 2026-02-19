"use client";

import { useContext, useMemo, useEffect } from "react";
import { useParams, usePathname, useSearchParams } from "next/navigation";
import { NewsContext, Contenido } from "../../../context/NewsContext";
import ArticleView from "../../../components/ArticleView";
import { SearchContext } from "../../../app/RootProviders";

export default function SectionPage() {
  const params = useParams();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const slug = Array.isArray(params.slug)
    ? params.slug[0]
    : params.slug || "";

  const sectionSlug = slug.toLowerCase();
  const lang: "ES" | "EN" = pathname.startsWith("/EN/") ? "EN" : "ES";

  const { articles, loadArticles, loading } = useContext(NewsContext);
  const { dateFilter } = useContext(SearchContext);

  const queryArticleSlug = searchParams.get("article");

  // 🔄 Cargar artículos si hay filtro de fecha
  useEffect(() => {
    if (!dateFilter) return;
    const [year, month, day] = dateFilter.split("-");
    loadArticles(year, month, day);
  }, [dateFilter, loadArticles]);

  // 📰 Filtrar artículos SOLO de esta sección
  const sectionArticles = useMemo(() => {
    return articles.filter(
      (a) => a.section.toLowerCase() === sectionSlug
    );
  }, [articles, sectionSlug]);

  // 🏆 Determinar artículo principal
  const mainArticle: Contenido | undefined = useMemo(() => {
    if (loading) return undefined;

    // Si viene ?article=
    if (queryArticleSlug) {
      return sectionArticles.find(
        (a) => a.url === queryArticleSlug
      );
    }

    // Si hay filtro por fecha
    if (dateFilter) {
      const filterDate = new Date(dateFilter);

      return (
        sectionArticles.find((a) => {
          const d = new Date(a.date);
          return (
            d.getFullYear() === filterDate.getFullYear() &&
            d.getMonth() === filterDate.getMonth() &&
            d.getDate() === filterDate.getDate()
          );
        }) || sectionArticles[0]
      );
    }

    // Por defecto: el más reciente
    return sectionArticles
      .slice()
      .sort(
        (a, b) =>
          new Date(b.date).getTime() - new Date(a.date).getTime()
      )[0];
  }, [
    sectionArticles,
    queryArticleSlug,
    dateFilter,
    loading,
  ]);

  return (
    <div className="px-4 md:px-16 py-12 space-y-16 max-w-6xl mx-auto">
      {/* LOADING */}
      {loading && (
        <p className="text-center text-gray-500 text-lg animate-pulse">
          {lang === "ES"
            ? "Cargando noticias…"
            : "Loading news…"}
        </p>
      )}

      {/* ARTÍCULO PRINCIPAL */}
      {!loading && mainArticle && (
        <ArticleView
          article={mainArticle}
        />
      )}

      {/* SIN ARTÍCULOS */}
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
