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
    // 🔹 1) Normalización de fecha
    //    - Si 'day' viene como "YYYY-MM-DD" (caso Home con dateFilter), lo partimos.
    //    - Si no, aplicamos los defaults de 'hoy' (como antes).
    let y = year;
    let m = month;
    let d = day;

    if (d && /^\d{4}-\d{2}-\d{2}$/.test(d)) {
      const parts = d.split("-");
      y = parts[0];
      m = parts[1];
      d = parts[2];
    }

    const today = new Date();
    y = y || today.getFullYear().toString();
    m = m || String(today.getMonth() + 1).padStart(2, "0");
    d = d || String(today.getDate()).padStart(2, "0");

    lang = (lang || language).toLowerCase();

    // 🔹 2) Evitar cargas duplicadas con la clave NORMALIZADA
    const loadKey = `${y}-${m}-${d}-${lang}-${section}`;
    if (lastLoadKeyRef.current === loadKey) return;
    lastLoadKeyRef.current = loadKey;

    setLoading(true);

    try {
      const query = `/api/news?year=${y}&month=${m}&day=${d}&lang=${lang}${
        section !== "all" ? `&section=${section}` : ""
      }`;

      // Opcional: log para debug
      // console.log("[NewsProvider] GET", query);

      const res = await fetch(query);
      if (!res.ok) {
        // console.warn("❗ Respuesta no OK:", res.status, res.statusText);
        return;
      }

      const data = await res.json();

      const availableDays = data.date ? [data.date.split("-")[2]] : [];
      setDaysAvailable(availableDays);

      const fetchedArticles: Contenido[] = (data.articles || []).map((art: any) => ({
        title: art.title,
        subtitle: art.subtitle,
        date: art.date,
        section: art.section,
        url: art.url,
        txtUrl: art.txtUrl,
        imageUrl: art.imageUrl,
      }));

      if (section === "all") {
        // Construimos los "principales" a partir del set obtenido
        const mainBySection: Record<string, Contenido> = {};
        for (const art of fetchedArticles) {
          if (!mainBySection[art.section]) {
            mainBySection[art.section] = art;
          }
        }

        if (fetchedArticles.length > 0) {
          // ✅ Si HAY artículos del día seleccionado, actualizamos el estado global
          setArticles(fetchedArticles);
          setMainArticlesBySection(mainBySection);
        } else {
          // ✅ Si NO hay artículos (o el backend devolvió vacío), mantenemos el estado previo
          //    para que la homepage no se quede en blanco (se verá "como antes").
          // console.info("ℹ️ No hay artículos para esa fecha. Conservando estado actual.");
        }
      } else {
        // Páginas de sección: aquí puedes decidir si quieres limpiar o no en vacío.
        // Para mantener consistencia, si vienen vacíos NO tocamos 'articles'.
        if (fetchedArticles.length > 0) {
          setArticles(fetchedArticles);
        } else {
          // console.info("ℹ️ Sección sin artículos nuevos. Conservando 'articles'.");
        }
      }
    } catch (err) {
      console.error("❌ NewsProvider loadArticles error:", err);
    } finally {
      setLoading(false);
    }
  }

  // 🔥 Carga inicial SIEMPRE modo HOME (hoy)
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