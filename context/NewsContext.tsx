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
  date: string;
  body?: string;
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
    lang = (lang || language).toLowerCase();

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

      const availableDays = data.date ? [data.date.split("-")[2]] : [];
      setDaysAvailable(availableDays);

      const fetchedArticles: Contenido[] = data.articles.map((art: any) => ({
        title: art.title,
        subtitle: art.subtitle,
        date: art.date,
        section: art.section,
        url: art.url,
        txtUrl: art.txtUrl,
        imageUrl: art.imageUrl,
      }));

      // 👉 SOLO Home puede tocar el estado global
      if (section === "all") {
        const mainBySection: Record<string, Contenido> = {};

        for (const art of fetchedArticles) {
          if (!mainBySection[art.section]) {
            mainBySection[art.section] = art;
          }
        }

        setArticles(fetchedArticles);
        setMainArticlesBySection(mainBySection);
      } else {
        // 👉 Las secciones solo usan articles
        setArticles(fetchedArticles);
      }
    } catch (err) {
      console.error("❌ NewsProvider loadArticles error:", err);
    } finally {
      setLoading(false);
    }
  }

  // 🔥 Carga inicial SIEMPRE modo HOME
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
