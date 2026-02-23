"use client";

import {
  createContext,
  useState,
  useEffect,
  useContext,
  ReactNode,
  useRef,
} from "react";
import { LanguageContext } from "../app/RootProviders";

/* ============================
   TYPES
============================ */

export interface Contenido {
  title: string;
  subtitle: string;
  date: string; // YYYY-MM-DD
  body?: string; // opcional
  section: string;
  url: string;
  txtUrl: string;
  imageUrl?: string;
}

interface NewsContextType {
  articles: Contenido[];
  mainArticlesBySection: Record<string, Contenido>;
  loading: boolean;
  daysAvailable: string[];
  loadArticles: (
    year?: string,
    month?: string,
    day?: string,
    section?: string,
    lang?: string
  ) => Promise<void>;
}

export const NewsContext = createContext<NewsContextType>({
  articles: [],
  mainArticlesBySection: {},
  loading: false,
  daysAvailable: [],
  loadArticles: async () => {},
});

interface Props {
  children: ReactNode;
}

/* ============================
   PROVIDER
============================ */

export function NewsProvider({ children }: Props) {
  const { language } = useContext(LanguageContext);

  const [articles, setArticles] = useState<Contenido[]>([]);
  const [mainArticlesBySection, setMainArticlesBySection] =
    useState<Record<string, Contenido>>({});
  const [loading, setLoading] = useState(false);
  const [daysAvailable, setDaysAvailable] = useState<string[]>([]);

  const lastLoadKeyRef = useRef<string | null>(null);

  async function loadArticles(
    year?: string,
    month?: string,
    day?: string,
    section: string = "all",
    lang?: string
  ) {
    const today = new Date();
    year = year || today.getFullYear().toString();
    month = month || String(today.getMonth() + 1).padStart(2, "0");
    day = day || String(today.getDate()).padStart(2, "0");
    lang = (lang || language).toLowerCase(); // 🔹 idioma en minúsculas para S3 / API

    const loadKey = `${year}-${month}-${day}-${lang}-${section}`;
    if (lastLoadKeyRef.current === loadKey) return;
    lastLoadKeyRef.current = loadKey;

    setLoading(true);

    try {
      const query = `/api/news?year=${year}&month=${month}&day=${day}&lang=${lang}${
        section !== "all" ? `&section=${section}` : ""
      }`;

      const res = await fetch(query);
      if (!res.ok) return;

      const data = await res.json();

      // Días disponibles: si la API devuelve date, tomamos el día
      const availableDays = data.date ? [data.date.split("-")[2]] : [];
      setDaysAvailable(availableDays);

      // Mapeamos artículos
      const fetchedArticles: Contenido[] = data.articles.map((art: any) => ({
        title: art.title,
        subtitle: art.subtitle,
        date: art.date,
        section: art.section,
        url: art.url,
        txtUrl: art.txtUrl,
        imageUrl: art.imageUrl,
      }));

      // Organizar principal por sección
      const mainBySection: Record<string, Contenido> = {};
      for (const art of fetchedArticles) {
        if (!mainBySection[art.section]) mainBySection[art.section] = art;
      }

      setArticles(fetchedArticles);
      setMainArticlesBySection(mainBySection);
    } catch (err) {
      console.error("❌ NewsProvider loadArticles error:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadArticles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language]);

  return (
    <NewsContext.Provider
      value={{
        articles,
        mainArticlesBySection,
        loading,
        daysAvailable,
        loadArticles,
      }}
    >
      {children}
    </NewsContext.Provider>
  );
}
