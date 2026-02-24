"use client";

import { useContext, useMemo } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { NewsContext } from "../context/NewsContext";
import { LanguageContext, SearchContext } from "../app/RootProviders";

export default function Home() {
  const { language } = useContext(LanguageContext);
  const { dateFilter } = useContext(SearchContext); // ← 🔹 Nos conectamos al filtro de fecha del Header
  const { articles, mainArticlesBySection, loading } = useContext(NewsContext);

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
    futuro: { es: "Futuro", en: "Future", color: "bg-[#0d6efd]" }, // azul para Futuro
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

  // 🔹 Secciones únicas a partir de los artículos que ya tenemos
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

  // 🔹 NUEVO: Filtrado por fecha según Header (SearchContext)
  // Si hay dateFilter (YYYY-MM-DD), nos quedamos con los artículos de ese día.
  const filteredArticles = useMemo(() => {
    if (!dateFilter) return articles;
    return articles.filter((a) => {
      // a.date puede ser "YYYY-MM-DD" o ISO; nos quedamos con la parte de fecha (YYYY-MM-DD)
      const aDate = a?.date ? new Date(a.date).toISOString().split("T")[0] : "";
      return aDate === dateFilter;
    });
  }, [articles, dateFilter]);

  // 🔹 Para cada sección, tomamos el "principal" del día filtrado si existe;
  // si no, usamos el mainArticlesBySection original (comportamiento anterior).
  const sectionArticles = useMemo(() => {
    return uniqueSections
      .map((sec) => {
        const firstOfDay = filteredArticles.find((a) => a.section === sec.slug);
        return firstOfDay || mainArticlesBySection[sec.slug];
      })
      .filter(Boolean) as typeof articles;
  }, [filteredArticles, mainArticlesBySection, uniqueSections]);

  // 🔹 Otros artículos: de la lista filtrada, eliminando los ya usados en secciones principales
  const otherArticles = useMemo(() => {
    const usedUrls = new Set(sectionArticles.map((a) => a.url));
    const pool = filteredArticles.length > 0 ? filteredArticles : articles;
    return pool.filter((a) => !usedUrls.has(a.url)).slice(0, 2);
  }, [articles, filteredArticles, sectionArticles]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh] text-gray-500">
        {language === "ES" ? "Cargando noticias..." : "Loading news..."}
      </div>
    );
  }

  // 🔹 Texto auxiliar bajo el título cuando hay filtro de fecha activo
  const dateBadge =
    dateFilter &&
    new Date(dateFilter).toLocaleDateString(
      language === "ES" ? "es-ES" : "en-GB",
      { day: "2-digit", month: "long", year: "numeric" }
    );

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

/* =======================================================================
   🔽🔽🔽 UTILIDADES AÑADIDAS (Bullets, Flashcards, Polls, Placeholders) 🔽🔽🔽
   - No se toca ninguna línea del componente anterior.
   - Puedes mover esto a `utils/parsers.ts` si prefieres.
   ======================================================================= */

export type Flashcard = { title: string; body: string };
export type Poll = { question: string; options: string[] };

const RE = {
  headers: {
    bullets: /^\s*Bullets\s*:\s*$/i,
    flashcards: /^\s*(Flashcards\s*:|---\s*FLASHCARDS\s*---)\s*$/i,
    polls: /^\s*((Encuestas|Polls)\s*:|---\s*POLLS\s*---)\s*$/i,
    any:
      /^\s*(Título|Title|Subtítulo|Subtitle|Bullets|Flashcards|Encuestas|Polls)\s*:|^---\s*(BULLETS?|FLASHCARDS|POLLS)\s*---\s*$/i,
  },
  placeholders: {
    bullets: /^---\s*BULLETS?\s*---\s*$/i,
    flashcards: /^---\s*FLASHCARDS\s*---\s*$/i,
    polls: /^---\s*POLLS\s*---\s*$/i,
    noGenerated: /^\s*No\s+generadas?\.?\s*$/i,
  },
  listItemStart: /^\s*([-*•–]|(\d+[\.\)]))\s+/,
  numberedQuestion: /^\s*\d+[\.\)]\s+(.+?)\s*$/,
  inlineFlashcard: /^\s*(?:\d+[\.\)]\s+)?([^:]+):\s*(.+)?\s*$/,
};

function stripListPrefix(line: string): string {
  return line.replace(RE.listItemStart, "").trim();
}

function isBoundary(line: string): boolean {
  return RE.headers.any.test(line || "");
}

/**
 * Extrae los bullets desde un bloque "Bullets:" del documento.
 * Convierte "1. ..." en bullets simples y devuelve cada bullet como string.
 * - "QUE MANEJE EN VEZ DE 1. PUES QUE SEA CADA BULLETPOINT"
 */
export function parseBulletsFromDoc(doc: string): string[] {
  const lines = doc.split(/\r?\n/);
  const bullets: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    if (RE.headers.bullets.test(lines[i])) {
      i++;
      while (i < lines.length && !isBoundary(lines[i])) {
        const line = lines[i].trim();
        if (!line) {
          i++;
          continue;
        }
        if (RE.listItemStart.test(line)) {
          bullets.push(stripListPrefix(line));
        }
        i++;
      }
      break;
    }
  }
  return bullets;
}

/**
 * Extrae flashcards soportando dos formatos:
 *  A) Bloque con títulos: "Economía:" / "Sociedad:" / "Futuro:" y el texto tras ":"
 *  B) Lista numerada: "1. Economía: texto..." → extrae título y texto tras los ":" ignorando la numeración
 */
export function parseFlashcardsFromDoc(doc: string): Flashcard[] {
  const lines = doc.split(/\r?\n/);
  const cards: Flashcard[] = [];

  const collectBlock = (startIndex: number) => {
    let i = startIndex;
    // Consumimos una posible línea en blanco inicial
    if (/^\s*$/.test(lines[i] || "")) i++;

    while (i < lines.length && !isBoundary(lines[i])) {
      const line = lines[i] ?? "";
      if (!line.trim()) {
        i++;
        continue;
      }
      const m = line.match(RE.inlineFlashcard);
      if (m) {
        const title = (m[1] || "").trim();
        let body = (m[2] || "").trim();

        // Si el cuerpo no está en la misma línea, acumulamos líneas siguientes hasta otro título o boundary
        let j = i + 1;
        const chunks: string[] = [];
        while (j < lines.length) {
          const peek = lines[j] ?? "";
          if (!peek.trim()) {
            j++;
            continue;
          }
          if (RE.inlineFlashcard.test(peek) || isBoundary(peek)) break;
          chunks.push(peek.trim());
          j++;
        }
        if (!body && chunks.length) body = chunks.join(" ");

        if (title) {
          cards.push({ title, body });
        }
        i = j;
        continue;
      }
      i++;
    }
    return i;
  };

  for (let i = 0; i < lines.length; i++) {
    if (RE.headers.flashcards.test(lines[i])) {
      i = collectBlock(i + 1);
      break;
    }
  }
  return cards;
}

/**
 * Extrae encuestas/polls.
 * - Reconoce "Encuestas:" y "Polls:" (y el placeholder ---POLLS---)
 * - Preguntas tipo "1) ¿...?" o "1. ¿...?"
 * - Respuestas: toma "- Sí" y "- No" si están; si no, autogenera ["Sí","No"]
 */
export function parsePollsFromDoc(doc: string): Poll[] {
  const lines = doc.split(/\r?\n/);
  const polls: Poll[] = [];

  const collectBlock = (startIndex: number) => {
    let i = startIndex;
    while (i < lines.length && !isBoundary(lines[i])) {
      const qLine = lines[i] ?? "";
      const qm = qLine.match(RE.numberedQuestion);
      if (qm) {
        const question = qm[1].trim();
        const options: string[] = [];
        let j = i + 1;
        while (j < lines.length) {
          const optLine = (lines[j] ?? "").trim();
          if (!optLine) {
            j++;
            continue;
          }
          if (RE.numberedQuestion.test(optLine) || isBoundary(optLine)) break;
          if (/^-\s*(Sí|Si|No)\s*$/i.test(optLine)) {
            options.push(optLine.replace(/^-+\s*/, ""));
          }
          j++;
        }
        // Por defecto, si no hay opciones explícitas, asignamos Sí/No
        if (options.length === 0) options.push("Sí", "No");
        polls.push({ question, options });
        i = j;
        continue;
      }
      i++;
    }
    return i;
  };

  for (let i = 0; i < lines.length; i++) {
    if (RE.headers.polls.test(lines[i])) {
      i = collectBlock(i + 1);
      break;
    }
  }
  return polls;
}

/**
 * Genera el bloque estandarizado de BULLETS (un bullet por línea con "- ").
 */
export function bulletsToBlock(bullets: string[], keepHeaderLine = true): string {
  const header = keepHeaderLine ? `---BULLETS---\n` : "";
  if (!bullets.length) return header.trim();
  return header + bullets.map((b) => `- ${b}`).join("\n");
}

/**
 * Genera el bloque estandarizado de FLASHCARDS:
 * Título como "Economía:" y el contenido tras los dos puntos.
 */
export function flashcardsToBlock(cards: Flashcard[], keepHeaderLine = true): string {
  const header = keepHeaderLine ? `---FLASHCARDS---\n` : "";
  if (!cards.length) return header.trim();
  return (
    header +
    cards
      .map((c) => `${c.title.trim()}: ${c.body ? c.body.trim() : ""}`.trim())
      .join("\n")
  );
}

/**
 * Genera el bloque estandarizado de POLLS:
 * "1) Pregunta" + opciones "- Sí" y "- No" para cada pregunta.
 */
export function pollsToBlock(polls: Poll[], keepHeaderLine = true): string {
  const header = keepHeaderLine ? `---POLLS---\n` : "";
  if (!polls.length) return header.trim();
  const parts: string[] = [];
  polls.forEach((p, idx) => {
    parts.push(`${idx + 1}) ${p.question}`);
    const opts = p.options.length ? p.options : ["Sí", "No"];
    opts.forEach((o) => parts.push(`   - ${o}`));
    parts.push(""); // línea en blanco entre preguntas
  });
  return header + parts.join("\n").trim();
}

/**
 * Elimina una línea "No generadas." si aparece justo debajo de un placeholder.
 */
function dropNoGeneradas(lines: string[], placeholderIndex: number): number {
  const next = lines[placeholderIndex + 1] ?? "";
  if (RE.placeholders.noGenerated.test(next)) {
    lines.splice(placeholderIndex + 1, 1);
    return 1;
  }
  return 0;
}

/**
 * Rellena placeholders inferiores (---BULLETS---, ---FLASHCARDS---, ---POLLS---)
 * con el contenido extraído de los bloques superiores (Bullets:, Flashcards:, Encuestas:/Polls:).
 * 🔹 No añade el texto "No generadas".
 * 🔹 Mapea "Bullets:" → ---BULLETS---, "Flashcards:" → ---FLASHCARDS---, "Encuestas/Polls:" → ---POLLS---
 */
export function fillPlaceholdersFromDoc(source: string): string {
  const bullets = parseBulletsFromDoc(source);
  const cards = parseFlashcardsFromDoc(source);
  const polls = parsePollsFromDoc(source);

  const lines = source.split(/\r?\n/);

  // Normalizamos BULLETS
  for (let i = 0; i < lines.length; i++) {
    if (RE.placeholders.bullets.test(lines[i])) {
      // quitar "No generadas." si está justo abajo
      dropNoGeneradas(lines, i);

      // bloque a insertar (sin repetir header)
      const block = bulletsToBlock(bullets, false);

      // limpiamos posibles restos hasta el próximo header/placeholder
      let j = i + 1;
      while (
        j < lines.length &&
        !RE.headers.any.test(lines[j]) &&
        !/^---\s*[A-Z-]+\s*---$/.test(lines[j])
      ) {
        j++;
      }
      // Reemplazamos el rango i+1..(j-1) por el bloque
      lines.splice(i + 1, Math.max(0, j - (i + 1)), block);
    }
  }

  // Normalizamos FLASHCARDS
  for (let i = 0; i < lines.length; i++) {
    if (RE.placeholders.flashcards.test(lines[i])) {
      dropNoGeneradas(lines, i);
      const block = flashcardsToBlock(cards, false);
      let j = i + 1;
      while (
        j < lines.length &&
        !RE.headers.any.test(lines[j]) &&
        !/^---\s*[A-Z-]+\s*---$/.test(lines[j])
      ) {
        j++;
      }
      lines.splice(i + 1, Math.max(0, j - (i + 1)), block);
    }
  }

  // Normalizamos POLLS
  for (let i = 0; i < lines.length; i++) {
    if (RE.placeholders.polls.test(lines[i])) {
      dropNoGeneradas(lines, i);
      const block = pollsToBlock(polls, false);
      let j = i + 1;
      while (
        j < lines.length &&
        !RE.headers.any.test(lines[j]) &&
        !/^---\s*[A-Z-]+\s*---$/.test(lines[j])
      ) {
        j++;
      }
      lines.splice(i + 1, Math.max(0, j - (i + 1)), block);
    }
  }

  return lines.join("\n");
}

/* =======================================================================
   ✅ Ejemplo rápido de uso (opcional). No afecta a tu lógica.
   -----------------------------------------------------------------------
   const input = `
   Título: ...
   Bullets:
   1. Enlace Móvil de Windows permite sincronizar...
   2. Aunque tiene funciones útiles...
   3. La herramienta requiere...
   4. La velocidad de transferencia...
   5. Existen alternativas gratuitas...

   Flashcards:
   Economía: ...
   Sociedad: ...
   Futuro: ...

   Encuestas:
   1) ¿Has utilizado Enlace Móvil...?
      - Sí
      - No

   ---BULLETS---
   No generadas.

   ---FLASHCARDS---
   No generadas.

   ---POLLS---
   No generadas.
   `;

   const output = fillPlaceholdersFromDoc(input);
   console.log(output);
   ======================================================================= */