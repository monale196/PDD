"use client";

import { useState, useEffect, useContext } from "react";
import { motion } from "framer-motion";
import { Contenido } from "../context/NewsContext";
import { LanguageContext } from "../app/RootProviders";
import RecommendationsGrid from "./RecommendationsGrid";

interface Flashcard {
  title: string;
  description: string;
}

interface Poll {
  question: string;
  options: string[];
}

interface ArticleViewProps {
  article: Contenido;
  recomendaciones?: Contenido[];
}

export default function ArticleView({ article, recomendaciones = [] }: ArticleViewProps) {
  const { language } = useContext(LanguageContext);

  const [body, setBody] = useState("");
  const [cleanTitle, setCleanTitle] = useState(article.title || "");
  const [cleanSubtitle, setCleanSubtitle] = useState(article.subtitle || "");
  const [formattedDate, setFormattedDate] = useState("");
  const [confidencialLine, setConfidencialLine] = useState("");

  const [bullets, setBullets] = useState<string[]>([]);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [polls, setPolls] = useState<Poll[]>([]);
  const [pollAnswers, setPollAnswers] = useState<Record<number, string>>({});

  const [expanded, setExpanded] = useState(false);

  // Iconos por categoría
  const categoryIcons: Record<string, string> = {
    Economia: "/icons/Economia.jpg",
    "Medio ambiente": "/icons/Medioambiente.jpg",
    Empleo: "/icons/Empleo.jpg",
    "Derechos y democracia": "/icons/DerechosyDemocracia.jpg",
  };

  useEffect(() => {
    async function fetchBody() {
      if (!article.txtUrl) return;

      try {
        const res = await fetch(article.txtUrl);
        const lines = (await res.text())
          .split("\n")
          .map(l => l.trim());

        const titleRegex = /^\**\s*(Título|Title):\**\s*/i;
        const subtitleRegex = /^\**\s*(Subtítulo|Subtitle):\**\s*/i;
        const dateRegex = /^\**\s*(Fecha|Date):\**\s*/i;

        const tLine = lines.find(l => titleRegex.test(l)) || "";
        const stLine = lines.find(l => subtitleRegex.test(l)) || "";
        const dLine = lines.find(l => dateRegex.test(l)) || article.date || "";

        const t = tLine.replace(titleRegex, "").replace(/\*/g, "").trim() || "Sin título";
        const st = stLine.replace(subtitleRegex, "").replace(/\*/g, "").trim() || "";
        const rawDate = dLine.replace(dateRegex, "").replace(/\*/g, "").trim();

        const parsedDate = !isNaN(new Date(rawDate).getTime())
          ? new Date(rawDate)
          : new Date(article.date || Date.now());

        const formatted = parsedDate.toLocaleDateString(
          language === "ES" ? "es-ES" : "en-GB",
          { day: "2-digit", month: "2-digit", year: "2-digit" }
        );

        setCleanTitle(t);
        setCleanSubtitle(st);
        setFormattedDate(formatted);

        const bodyStartIndex = Math.max(
          tLine ? lines.indexOf(tLine) + 1 : 0,
          stLine ? lines.indexOf(stLine) + 1 : 0,
          dLine ? lines.indexOf(dLine) + 1 : 0
        );

        const bodyLines = lines.slice(bodyStartIndex);

        let detectedConfidencial = "";
        const filteredBody = bodyLines.filter(line => {
          const esLine = line.includes("Artículo basado en información de El Confidencial");
          const enLine = line.includes("Article based on information from El Confidencial");
          if (esLine || enLine) {
            detectedConfidencial = line.replace(/\*/g, "");
            return false;
          }
          return true;
        });
        setConfidencialLine(detectedConfidencial);

        const bulletsStart = filteredBody.indexOf("---BULLETS---");
        const flashcardsStart = filteredBody.indexOf("---FLASHCARDS---");
        const pollsStart = filteredBody.indexOf("---POLLS---");

        if (bulletsStart !== -1) {
          const end = flashcardsStart !== -1 ? flashcardsStart : pollsStart !== -1 ? pollsStart : filteredBody.length;
          setBullets(filteredBody.slice(bulletsStart + 1, end).filter(l => l !== ""));
        }

        if (flashcardsStart !== -1) {
          const end = pollsStart !== -1 ? pollsStart : filteredBody.length;
          const parsedFlashcards: Flashcard[] = filteredBody
            .slice(flashcardsStart + 1, end)
            .filter(l => l !== "")
            .map(line => {
              const [title, desc] = line.split(" - ");
              return { title: title?.trim() || "", description: desc?.trim() || "" };
            });
          setFlashcards(parsedFlashcards);
        }

        if (pollsStart !== -1) {
          const parsedPolls: Poll[] = filteredBody
            .slice(pollsStart + 1)
            .filter(l => l !== "")
            .map(line => {
              const [question, opts] = line.split(" | ");
              return { question: question?.trim() || "", options: opts?.split(",").map(o => o.trim()) || [] };
            });
          setPolls(parsedPolls);
        }

        const specialIndexes = [bulletsStart, flashcardsStart, pollsStart].filter(i => i !== -1);
        const bodyEndIndex = specialIndexes.length ? Math.min(...specialIndexes) : filteredBody.length;
        setBody(filteredBody.slice(0, bodyEndIndex).join("\n"));

      } catch {
        setBody(article.body || "");
      }
    }

    fetchBody();
  }, [article, language]);

  if (!article) return null;

  const previewLines = body.split("\n").filter(l => l.trim() !== "").slice(0, 3).join("\n");

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 120 }}
      className="rounded-3xl shadow-lg overflow-hidden max-w-6xl mx-auto bg-[var(--color-card)]"
    >
      {/* IMAGEN PRINCIPAL */}
      {article.imageUrl && (
        <div className="relative w-full h-80 md:h-[400px]">
          <img src={article.imageUrl} alt={cleanTitle} className="w-full h-full object-cover" />
          {/* BULLETS FLOTANTES */}
          {bullets.length > 0 && (
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="absolute top-4 left-4 md:top-8 md:left-8 bg-[var(--color-card)] bg-opacity-95 p-6 rounded-2xl shadow-2xl max-w-md border-2 border-[var(--color-accent)]"
            >
              <h4 className="text-lg font-bold mb-2 text-[var(--color-foreground)]">{language === "ES" ? "En breve" : "In brief"}</h4>
              <ul className="list-disc list-inside space-y-2 text-[var(--color-gray)] text-sm font-medium">
                {bullets.map((b, i) => <li key={i}>{b}</li>)}
              </ul>
            </motion.div>
          )}
        </div>
      )}

      {/* CONTENIDO */}
      <div className="p-6 md:p-8">
        <h1 className="text-3xl md:text-4xl font-extrabold mb-2 text-[var(--color-foreground)]">{cleanTitle}</h1>
        {cleanSubtitle && <h3 className="text-lg md:text-xl text-[var(--color-gray)] mb-4">{cleanSubtitle}</h3>}
        {formattedDate && <p className="text-sm text-[var(--color-gray)] mb-6">{formattedDate}</p>}

        <p className="whitespace-pre-wrap text-lg md:text-xl leading-relaxed mb-4">{expanded ? body : previewLines}</p>
        {body && body.length > previewLines.length && (
          <button onClick={() => setExpanded(!expanded)}
            className="mt-2 px-6 py-2 bg-[var(--color-accent)] text-white rounded-full font-semibold hover:opacity-90 transition">
            {expanded ? (language === "ES" ? "Leer menos" : "Read less") : (language === "ES" ? "Leer más" : "Read more")}
          </button>
        )}

        {/* FLASHCARDS */}
        {flashcards.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 mt-6">
            {flashcards.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-br from-[var(--color-accent)]/20 to-[var(--color-accent)]/5 rounded-3xl shadow-xl p-4 flex flex-col items-center text-center cursor-pointer"
              >
                <div className="w-16 h-16 bg-[var(--color-accent)] rounded-full flex items-center justify-center mb-3 shadow-lg">
                  <img src={categoryIcons[f.title] || "/icons/default.jpg"} alt={f.title} className="w-10 h-10 object-contain" />
                </div>
                <h5 className="font-semibold mb-1 text-[var(--color-foreground)]">{f.title}</h5>
                <p className="text-[var(--color-gray)] text-sm">{f.description}</p>
              </motion.div>
            ))}
          </div>
        )}

        {/* POLLS */}
        {polls.length > 0 && (
          <div className="space-y-4 mb-6">
            {polls.map((p, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-gradient-to-r from-[var(--color-accent)]/20 to-[var(--color-accent)]/10 rounded-2xl shadow-md p-4"
              >
                <p className="font-semibold mb-2 text-[var(--color-foreground)]">{p.question}</p>
                <div className="flex gap-3 flex-wrap">
                  {p.options.map((opt, j) => (
                    <motion.button
                      key={j}
                      whileTap={{ scale: 0.9 }}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition
                        ${pollAnswers[i] === opt
                          ? "bg-[var(--color-foreground)] text-white shadow-lg"
                          : "bg-[var(--color-accent)] text-white hover:opacity-90"
                        }`}
                      onClick={() => setPollAnswers(prev => ({ ...prev, [i]: opt }))}
                    >
                      {opt}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {confidencialLine && <p className="text-sm italic text-[var(--color-gray)] mb-6">{confidencialLine}</p>}

        {recomendaciones.length > 0 && <RecommendationsGrid articles={recomendaciones} />}

        {article.url && (
          <div className="mt-6 text-center">
            <a href={`https://www.elconfidencial.com${article.url}`} target="_blank" rel="noopener noreferrer"
              className="inline-block px-6 py-3 bg-[var(--color-accent)] text-white rounded-full font-semibold hover:opacity-90 transition">
              {language === "ES" ? "Leer artículo completo en El Confidencial" : "Read full article on El Confidencial"}
            </a>
          </div>
        )}
      </div>
    </motion.div>
  );
}
