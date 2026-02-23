"use client";

import { useEffect, useState, useContext } from "react";
import { motion } from "framer-motion";
import RecommendationsGrid from "./RecommendationsGrid";
import { LanguageContext } from "../app/RootProviders";

const iconMap: Record<string, string> = {
  Economía: "/icons/Economy.png",
  Economy: "/icons/Economy.png",
  Sociedad: "/icons/Society.png",
  Society: "/icons/Society.png",
  Futuro: "/icons/Future.png",
  Future: "/icons/Future.png",
};

const labels = {
  es: {
    brief: "En breve",
    why: "¿Por qué importa?",
    opinion: "¿Qué opinas?",
    debate: "Debate",
    placeholder: "Escribe tu opinión…",
    anonymous: "Publicar como anónimo",
    send: "Enviar",
    name: "Tu nombre (opcional)",
  },
  en: {
    brief: "In brief",
    why: "Why it matters",
    opinion: "What do you think?",
    debate: "Discussion",
    placeholder: "Write your opinion…",
    anonymous: "Post anonymously",
    send: "Send",
    name: "Your name (optional)",
  },
};

type Flashcard = { title: string; summary: string };
type Poll = { question: string; options: string[]; votes: number[] };

export default function ArticleView({ article, allArticles }: any) {
  const { language } = useContext(LanguageContext); // "ES" o "EN"
  const lang = language.toLowerCase() as "es" | "en";
  const t = labels[lang];

  const [bullets, setBullets] = useState<string[]>([]);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [polls, setPolls] = useState<Poll[]>([]);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [anonymous, setAnonymous] = useState(true);
  const [comment, setComment] = useState(""); // 🟢 textarea estado

  const cleanText = (text?: string) =>
    text?.replace(/^(Título:|Title:|Subtítulo:|Subtitle:)\s*/i, "") || "";

  const title =
    cleanText(lang === "en" ? article.title_en : article.title_es) ||
    cleanText(article.title) ||
    "Sin título";
  const subtitle =
    cleanText(lang === "en" ? article.subtitle_en : article.subtitle_es) ||
    cleanText(article.subtitle) ||
    "";
  const txtUrl =
    (lang === "en" ? article.txtUrl_en : article.txtUrl_es) || article.txtUrl || "";
  const imageUrl = txtUrl ? txtUrl.replace("article.txt", "image.jpg") : "/default-image.jpg";

  /* ───────── PARSE TXT ───────── */
  useEffect(() => {
    if (!txtUrl) return;

    fetch(txtUrl)
      .then((r) => r.text())
      .then((txt) => {
        const lines = txt.split("\n");
        const b: string[] = [];
        const f: Flashcard[] = [];
        const p: Poll[] = [];
        let section = "";
        let currentPoll: Poll | null = null;

        lines.forEach((raw) => {
          const line = raw.trim();
          if (line.startsWith("---")) {
            section = line;
            return;
          }

          if (section === "---BULLETS---" && line.startsWith("-")) {
            b.push(line.replace(/^-\s*/, ""));
          }

          if (section === "---FLASHCARDS---" && line.includes(":")) {
            const [t, s] = line.split(":");
            f.push({
              title: t.replace(/^\d+\.\s*/, "").trim(),
              summary: s.trim(),
            });
          }

          if (section === "---POLLS---") {
            if (/^\d+\./.test(line)) {
              if (currentPoll) p.push(currentPoll);
              const q = line.replace(/^\d+\.\s*/, "");
              const inline = q.match(/\((.*?)\)/);
              if (inline) {
                const options = inline[1].split("/").map((o) => o.trim());
                currentPoll = {
                  question: q.replace(/\(.*?\)/, "").trim(),
                  options,
                  votes: Array(options.length).fill(0),
                };
              } else {
                currentPoll = { question: q, options: [], votes: [] };
              }
            }
            if (line.startsWith("-") && currentPoll) {
              currentPoll.options.push(line.replace("- ", ""));
              currentPoll.votes.push(0);
            }
          }
        });

        if (currentPoll) p.push(currentPoll);
        setBullets(b);
        setFlashcards(f);
        setPolls(p);
      });
  }, [txtUrl, lang]);

  const vote = (pi: number, oi: number) => {
    if (answers[pi] !== undefined) return;
    setAnswers({ ...answers, [pi]: oi });
    setPolls((prev) =>
      prev.map((p, i) =>
        i === pi
          ? { ...p, votes: p.votes.map((v, j) => (j === oi ? v + 1 : v)) }
          : p
      )
    );
  };

  return (
    <article className="max-w-6xl mx-auto px-6 py-20 space-y-28">
      {/* HEADER */}
      <header>
        <h1 className="text-6xl font-extrabold mb-4">{title}</h1>
        {subtitle && <p className="text-3xl text-gray-600">{subtitle}</p>}
      </header>

      {/* EN BREVE + IMAGEN mitad y mitad con sombra azul marino */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-gray-300/50 text-black backdrop-blur-xl rounded-3xl p-8 shadow-[0_4px_20px_rgba(0,0,64,0.4)] flex flex-col">
          <h3 className="font-extrabold text-3xl mb-4">{t.brief}</h3>
          <ul className="list-disc list-inside space-y-3 text-lg">
            {bullets.map((b, i) => (
              <li key={i}>{b}</li>
            ))}
          </ul>
        </div>
        <div className="shadow-[0_4px_20px_rgba(0,0,64,0.4)] rounded-3xl">
          <img
            src={imageUrl}
            className="w-full h-full object-cover rounded-3xl"
          />
        </div>
      </div>

      {/* FLASHCARDS */}
      <section>
        <h2 className="text-4xl font-extrabold mb-14">{t.why}</h2>
        <div className="grid md:grid-cols-3 gap-12">
          {flashcards.map((c, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.07 }}
              className="bg-white rounded-3xl p-12 text-center shadow-[0_6px_18px_rgba(59,130,246,0.35)]"
            >
              <img src={iconMap[c.title]} className="w-24 h-24 mx-auto mb-8" />
              <h3 className="font-bold text-2xl mb-5">{c.title}</h3>
              <p className="text-gray-600 text-lg">{c.summary}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* POLLS */}
      <section>
        <h2 className="text-4xl font-extrabold mb-14">{t.opinion}</h2>
        <div className="grid md:grid-cols-2 gap-12">
          {polls.map((p, pi) => {
            const maxVotes = Math.max(...p.votes);
            return (
              <div key={pi} className="bg-white p-12 rounded-3xl shadow-xl">
                <p className="text-2xl font-semibold mb-10 text-center">{p.question}</p>
                <div className="flex flex-wrap gap-6 justify-center">
                  {p.options.map((o, oi) => {
                    const isWinning = p.votes[oi] === maxVotes && maxVotes > 0;
                    return (
                      <div key={oi} className="flex flex-col items-center">
                        <motion.button
                          whileHover={{ scale: 1.12 }}
                          whileTap={{ scale: 0.92 }}
                          onClick={() => vote(pi, oi)}
                          disabled={answers[pi] !== undefined}
                          className={`px-10 py-5 rounded-full font-bold text-xl transition ${
                            answers[pi] === oi
                              ? "bg-gray-500 text-white"
                              : "bg-blue-100 text-blue-700"
                          } ${isWinning ? "ring-2 ring-green-500" : ""}`}
                        >
                          {o}
                        </motion.button>
                        {maxVotes > 0 && (
                          <span className="text-sm mt-2 text-gray-700">
                            {p.votes[oi]} {lang === "en" ? "votes" : "votos"}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* DEBATE */}
      <section>
        <h2 className="text-4xl font-extrabold mb-8">{t.debate}</h2>

        {!anonymous && (
          <input
            placeholder={t.name}
            className="w-full mb-6 p-5 rounded-xl border text-xl"
          />
        )}

        <textarea
          placeholder={t.placeholder}
          value={comment} // 🟢 bind value
          onChange={(e) => setComment(e.target.value)}
          className="w-full p-6 rounded-xl border min-h-[160px] text-xl mb-6"
        />

        <label className="flex items-center gap-3 mb-8 text-lg">
          <input
            type="checkbox"
            checked={anonymous}
            onChange={() => setAnonymous(!anonymous)}
          />
          {t.anonymous}
        </label>

        <button
          disabled={!comment.trim()} // 🟢 solo habilitado si hay comentario
          className={`px-10 py-5 rounded-full text-xl font-bold transition ${
            comment.trim()
              ? "bg-gray-500 text-white"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          {t.send}
        </button>
      </section>

      {/* RECOMMENDATIONS */}
      {allArticles && allArticles.length > 0 && (
        <RecommendationsGrid articles={allArticles} currentArticle={article} />
      )}
    </article>
  );
}
