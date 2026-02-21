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

export interface Contenido {
  title: string;
  subtitle: string;
  date: string; // YYYY-MM-DD
  body: string;
  section: string;
  url: string;
  txtUrl?: string;
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
    section?: string
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

// 🔹 Funciones para llamar a la API
async function listAvailableDays(year: string, month: string) {
  const res = await fetch(`/api/news?year=${year}&month=${month}`);
  const text = await res.text(); // nunca res.json()
  
  // Aquí parsea los txt que tengas en S3 o simplemente devuelve algo vacío si no hay
  const files = text.split("\n").filter(Boolean); // ejemplo
  return files;
}

async function listNews(year: string, month: string, day: string, lang: string, section: string) {
  const res = await fetch(`/api/news?year=${year}&month=${month}&day=${day}&section=${section}`);
  const text = await res.text(); // texto plano, no JSON
  const files = text.split("\n").filter(Boolean);

  return files
    .map((key) => {
      if (key.endsWith(".txt")) return { txtUrl: `https://${process.env.NEXT_PUBLIC_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}` };
      if (key.endsWith(".jpg")) return { imageUrl: `https://${process.env.NEXT_PUBLIC_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}` };
      return null;
    })
    .filter(Boolean);
}

export function NewsProvider({ children }: Props) {
  const { language } = useContext(LanguageContext);

  const [articles, setArticles] = useState<Contenido[]>([]);
  const [mainArticlesBySection, setMainArticlesBySection] =
    useState<Record<string, Contenido>>({});
  const [loading, setLoading] = useState(false);
  const [daysAvailable, setDaysAvailable] = useState<string[]>([]);

  const isLoadingRef = useRef(false);
  const lastLoadKeyRef = useRef<string | null>(null);

  async function loadArticles(
    year?: string,
    month?: string,
    day?: string,
    section?: string
  ) {
    const today = new Date();
    year = year || today.getFullYear().toString();
    month = month || String(today.getMonth() + 1).padStart(2, "0");
    day = day || String(today.getDate()).padStart(2, "0");

    const loadKey = `${year}-${month}-${day}-${language}-${section || "all"}`;
    if (lastLoadKeyRef.current === loadKey || isLoadingRef.current) return;

    isLoadingRef.current = true;
    lastLoadKeyRef.current = loadKey;
    setLoading(true);

    try {
      // 🔹 Obtener días disponibles vía API
      const availableDays = await listAvailableDays(year, month);
      setDaysAvailable(availableDays);

      const sectionsToLoad = section
        ? [section]
        : [
            "economia",
            "empleo",
            "educacion",
            "medio_ambiente",
            "tecnologia",
            "derechos_democracia",
            "futuro",
          ];

      const sectionResults = await Promise.all(
        sectionsToLoad.map(async (sec) => {
          const news = await listNews(year!, month!, day!, language.toLowerCase(), sec);

          const articlesFromSection = await Promise.all(
            news.map(async (n: any) => {
              if (!n.txtUrl) return null;

              try {
                const txtRes = await fetch(n.txtUrl);
                const txt = await txtRes.text();
                const lines = txt.split("\n").map((l) => l.trim());

                const title = lines[0]?.replace("**Title:** ", "") || "Sin título";
                const subtitle = lines[1]?.replace("**Subtitle:** ", "") || "";
                const dateLine = lines[2]?.replace("**Date:** ", "") || `${day}-${month}-${year}`;
                const body = lines.slice(3).join("\n");

                let isoDate = `${year}-${month}-${day}`;
                const parts = dateLine.split(/[-/]/);
                if (parts.length === 3) {
                  const [d, m, y] = parts;
                  isoDate = `${y.padStart(4, "0")}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
                }

                const urlPath = `/${sec}/${n.txtUrl?.split("/").pop()?.replace(".txt", "")}`;
                const imageUrl = n.imageUrl || n.txtUrl.replace("index.txt", "main-image.jpg");

                return {
                  title,
                  subtitle,
                  date: isoDate,
                  body,
                  section: sec,
                  url: urlPath,
                  txtUrl: n.txtUrl,
                  imageUrl,
                } as Contenido;

              } catch (err) {
                console.error("Error leyendo txt:", n.txtUrl, err);
                return null;
              }
            })
          );

          return articlesFromSection.filter(Boolean) as Contenido[];
        })
      );

      const allArticles = sectionResults.flat();

      const grouped: Record<string, Contenido> = {};
      allArticles.forEach((a) => {
        if (!grouped[a.section]) grouped[a.section] = a;
      });

      setArticles(allArticles);
      setMainArticlesBySection(grouped);

    } catch (err) {
      console.error("Error cargando noticias:", err);
    } finally {
      setLoading(false);
      isLoadingRef.current = false;
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
