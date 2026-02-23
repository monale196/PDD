"use client";

import { useContext, useMemo, useEffect } from "react";
import { useParams, usePathname, useSearchParams } from "next/navigation";
import { NewsContext, Contenido } from "../../../context/NewsContext";
import ArticleView from "../../../components/ArticleView";
import { SearchContext, LanguageContext } from "../../../app/RootProviders";

export default function SectionPage() {
  const params = useParams();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug || "";
  const sectionSlug = slug.toLowerCase();

  const lang: "ES" | "EN" = pathname.startsWith("/EN/") ? "EN" : "ES";
  const langLower = lang.toLowerCase();

  const { articles, loadArticles, loading } = useContext(NewsContext);
  const { dateFilter } = useContext(SearchContext);

  const queryArticleSlug = searchParams.get("article");

  /* ============================
     FETCH POR SECCIÓN
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
  }, [dateFilter, sectionSlug, loadArticles, langLower]);

  /* ============================
     ARTÍCULO PRINCIPAL
  ============================ */
  const mainArticle: Contenido | undefined = useMemo(() => {
    if (loading || articles.length === 0) return undefined;

    if (queryArticleSlug) {
      return articles.find((a) =>
        a.url.endsWith(`/${queryArticleSlug}`)
      );
    }

    if (dateFilter) {
      return articles[0];
    }

    return articles
      .slice()
      .sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      )[0];
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

      {!loading && mainArticle && <ArticleView article={mainArticle} />}

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
