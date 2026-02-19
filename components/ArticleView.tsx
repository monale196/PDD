"use client";

import { useState, useEffect, useContext } from "react";
import { motion } from "framer-motion";
import { Contenido } from "../context/NewsContext";
import { LanguageContext } from "../app/RootProviders";

interface Flashcard {
  title: string;
  summary: string;
  icon?: string;
}

interface Poll {
  question: string;
  options: string[];
}

interface ArticleViewProps {
  article: Contenido;
}

export default function ArticleView({ article }: ArticleViewProps) {
  const { language } = useContext(LanguageContext);

  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [date, setDate] = useState("");
  const [body, setBody] = useState("");
  const [bullets, setBullets] = useState<string[]>([]);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [polls, setPolls] = useState<Poll[]>([]);
  const [pollAnswers, setPollAnswers] = useState<Record<number, number>>({});
  const [imageUrl, setImageUrl] = useState<string>("");

  // Iconos automáticos por idioma
  const iconMapES: Record<string, string> = {
    "Economia": "🌍",
    "Medio Ambiente": "🌡️",
    "Empleo": "🌳",
    "Derecho y Democracia": "🏭",
  };
  const iconMapEN: Record<string, string> = {
    "Economy": "🌍",
    "Enviroment": "🌡️",
    "Employment": "🌳",
    "Law and Democracy": "🏭",
  };

  useEffect(() => {
    async function fetchText() {
      if (!article.txtUrl) return;

      const res = await fetch(article.txtUrl);
      const lines = (await res.text()).split("\n").map(l => l.trim());

      // Título, subtítulo, fecha
      const tLine = lines.find(l => /^(\*?\s*)?(Título|Title):/i.test(l)) || "";
      const stLine = lines.find(l => /^(\*?\s*)?(Subtítulo|Subtitle):/i.test(l)) || "";
      const dLine = lines.find(l => /^(\*?\s*)?(Fecha|Date):/i.test(l)) || article.date || "";

      setTitle(tLine.replace(/^(\*?\s*)?(Título|Title):/i, "").trim() || article.title || "Sin título");
      setSubtitle(stLine.replace(/^(\*?\s*)?(Subtítulo|Subtitle):/i, "").trim() || article.subtitle || "");
      const parsedDate = !isNaN(new Date(dLine).getTime()) ? new Date(dLine) : new Date(article.date || Date.now());
      setDate(parsedDate.toLocaleDateString(language === "ES" ? "es-ES" : "en-GB", { day: "2-digit", month: "short", year: "2-digit" }));

      // Bullets → En breve
      const bulletsStart = lines.indexOf("---BULLETS---");
      if (bulletsStart !== -1) {
        const end = lines.indexOf("---FLASHCARDS---") !== -1 ? lines.indexOf("---FLASHCARDS---") : lines.length;
        setBullets(lines.slice(bulletsStart + 1, end).filter(l => l !== ""));
      }

      // Flashcards → Why this matters
      const flashStart = lines.indexOf("---FLASHCARDS---");
      if (flashStart !== -1) {
        const end = lines.indexOf("---POLLS---") !== -1 ? lines.indexOf("---POLLS---") : lines.length;
        const flashLines = lines.slice(flashStart + 1, end).filter(l => l !== "");
        const tempFlash: Flashcard[] = [];
        for (let i = 0; i < flashLines.length; i += 3) {
          const title = flashLines[i] || "";
          tempFlash.push({
            title,
            summary: flashLines[i + 1] || "",
            icon: flashLines[i + 2] || (language === "ES" ? iconMapES[title] : iconMapEN[title]),
          });
        }
        setFlashcards(tempFlash);
      }

      // Polls → Qué opinas
      const pollStart = lines.indexOf("---POLLS---");
      if (pollStart !== -1) {
        const pollLines = lines.slice(pollStart + 1).filter(l => l !== "");
        const tempPolls: Poll[] = [];
        for (let i = 0; i < pollLines.length; i += 2) {
          const question = pollLines[i];
          const options = pollLines[i + 1]?.split("|").map(o => o.trim()) || [];
          tempPolls.push({ question, options });
        }
        setPolls(tempPolls);

        const stored = localStorage.getItem(`pollAnswers_${article.url}`);
        if (stored) setPollAnswers(JSON.parse(stored));
      }

      // Body
      const bodyStart = Math.max(
        tLine ? lines.indexOf(tLine) + 1 : 0,
        stLine ? lines.indexOf(stLine) + 1 : 0,
        dLine ? lines.indexOf(dLine) + 1 : 0
      );
      setBody(lines.slice(bodyStart).join("\n"));

      // Imagen principal: buscar cualquier JPG en la misma carpeta del TXT
      try {
        const folderUrl = article.txtUrl.replace(/\/[^\/]+\.txt$/, "/");
        const possibleJpg = article.txtUrl.replace(/\.txt$/, ".jpg");
        let found = false;

        const resp = await fetch(possibleJpg);
        if (resp.ok) {
          setImageUrl(possibleJpg);
          found = true;
        }

        if (!found) {
          const fallback = folderUrl + "index.jpg";
          const fallbackResp = await fetch(fallback);
          if (fallbackResp.ok) setImageUrl(fallback);
        }
      } catch (e) {
        console.warn("No se pudo cargar la imagen principal:", e);
      }
    }

    fetchText();
  }, [article, language]);

  const handlePollClick = (pollIndex: number, optionIndex: number) => {
    setPollAnswers(prev => {
      const updated = { ...prev, [pollIndex]: optionIndex };
      localStorage.setItem(`pollAnswers_${article.url}`, JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto">
      {/* TITULO */}
      <h1 className="text-3xl md:text-4xl font-extrabold mb-2 text-[var(--color-foreground)]">{title}</h1>
      {subtitle && <h3 className="text-lg md:text-xl text-[var(--color-gray)] mb-6">{subtitle}</h3>}

      {/* SECCION SUPERIOR: BULLETS + BOTON (IZQ) / IMAGEN (DER) */}
      <div className="flex flex-col md:flex-row justify-between items-start mb-8 gap-6">
        {/* IZQUIERDA: Bullets + boton */}
        <div className="flex flex-col space-y-4 md:max-w-md">
          {bullets.length > 0 && (
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-[var(--color-card)] p-6 rounded-2xl shadow-md border border-[var(--color-accent)]"
            >
              <h4 className="text-lg font-bold mb-2">{language === "ES" ? "En breve" : "In brief"}</h4>
              <ul className="list-disc list-inside space-y-2 text-[var(--color-gray)] text-sm font-medium">
                {bullets.map((b, i) => <li key={i}>{b}</li>)}
              </ul>
            </motion.div>
          )}

          {/* Botón El Confidencial */}
          <button className="px-6 py-3 bg-[var(--color-accent)] text-white rounded-full font-semibold hover:opacity-90 transition">
            {language === "ES" ? "Leer más en El Confidencial" : "Read more on El Confidencial"}
          </button>
        </div>

        {/* DERECHA: Imagen principal */}
        {imageUrl && (
          <div className="w-full md:w-2/3 h-80 md:h-[400px]">
            <img src={imageUrl} alt={title} className="w-full h-full object-cover rounded-2xl shadow-md" />
          </div>
        )}
      </div>

      {/* FLASHCARDS */}
      {flashcards.length > 0 && (
        <div className="mb-10">
          <h2 className="text-xl font-bold mb-4">{language === "ES" ? "Por qué importa" : "Why this matters"}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {flashcards.map((f, i) => (
              <motion.div key={i} whileHover={{ scale: 1.03 }} className="bg-[var(--color-card)] p-4 rounded-2xl shadow-md border border-[var(--color-accent)]">
                <div className="flex items-center mb-2 space-x-2">
                  {f.icon && <span className="text-2xl">{f.icon}</span>}
                  <h4 className="font-semibold text-[var(--color-foreground)]">{f.title}</h4>
                </div>
                <p className="text-[var(--color-gray)] text-sm">{f.summary}</p>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* POLLS */}
      {polls.length > 0 && (
        <div className="mb-10">
          <h2 className="text-xl font-bold mb-4">{language === "ES" ? "Qué opinas" : "What do you think?"}</h2>
          <div className="grid grid-cols-2 gap-4">
            {polls.map((poll, pIndex) =>
              poll.options.map((opt, oIndex) => (
                <motion.div
                  key={`${pIndex}_${oIndex}`}
                  whileTap={{ scale: 0.95 }}
                  className="bg-[var(--color-card)] p-4 rounded-2xl shadow-md border border-[var(--color-accent)] flex flex-col items-start"
                >
                  {oIndex === 0 && <p className="font-semibold mb-2">{poll.question}</p>}
                  <button
                    onClick={() => handlePollClick(pIndex, oIndex)}
                    className={`px-4 py-2 mb-1 rounded-full font-medium text-sm transition ${
                      pollAnswers[pIndex] === oIndex
                        ? "bg-[var(--color-accent)] text-white"
                        : "bg-[var(--color-gray)] text-[var(--color-foreground)] hover:bg-[var(--color-accent)] hover:text-white"
                    }`}
                  >
                    {opt}
                  </button>
                  <span className="text-xs text-[var(--color-gray)] mt-1">
                    {pollAnswers[pIndex] === oIndex ? 1 : 0} {language === "ES" ? "votos" : "votes"}
                  </span>
                </motion.div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
