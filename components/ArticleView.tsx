"use client";
export const dynamic = "force-dynamic";

import { useEffect, useState, useContext } from "react";
import { motion } from "framer-motion";
import RecommendationsGrid from "./RecommendationsGrid";
import { LanguageContext } from "@/app/RootProviders";

/* ───────── ICONOS FLASHCARDS ───────── */
const iconMap: Record<string, string> = {
  Economía: "/icons/Economy.png",
  Economy: "/icons/Economy.png",
  Sociedad: "/icons/Society.png",
  Society: "/icons/Society.png",
  Futuro: "/icons/Future.png",
  Future: "/icons/Future.png",
};

/* ───────── LABELS ───────── */
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
    votes: "votos",
    like: "Me gusta",
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
    votes: "votes",
    like: "Like",
  },
};

type Flashcard = {
  title: string;
  summary: string;
};

type Poll = {
  question: string;
  options: string[];
  votes: number[];
};

type Comment = {
  id: number;
  text: string;
  name: string;
  likes: number;
  createdAt: string;
};

export default function ArticleView({ article, allArticles }: any) {
  const { language } = useContext(LanguageContext);
  const lang = language.toLowerCase() as "es" | "en";
  const t = labels[lang];

  /* ───────── STATE ───────── */
  const [bullets, setBullets] = useState<string[]>([]);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [polls, setPolls] = useState<Poll[]>([]);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState("");
  const [name, setName] = useState("");
  const [anonymous, setAnonymous] = useState(true);

  /* ───────── HELPERS ───────── */
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
    (lang === "en" ? article.txtUrl_en : article.txtUrl_es) ||
    article.txtUrl ||
    "";

  const imageUrl = txtUrl
    ? txtUrl.replace("article.txt", "image.jpg")
    : "/default-image.jpg";

  /* ───────── LOAD COMMENTS ───────── */
  useEffect(() => {
    fetch("/api/debate")
      .then(r => r.json())
      .then(setComments);
  }, []);

  /* ───────── PARSE TXT ───────── */
  useEffect(() => {
    if (!txtUrl) return;

    fetch(txtUrl)
      .then(r => r.text())
      .then(txt => {
        const lines = txt.split("\n");
        const b: string[] = [];
        const f: Flashcard[] = [];
        const p: Poll[] = [];

        let section = "";
        let currentFlash: Flashcard | null = null;
        let currentPoll: Poll | null = null;

        lines.forEach(raw => {
          const line = raw.trim();
          if (!line) return;

          if (line.startsWith("---")) {
            if (currentFlash) f.push(currentFlash);
            if (currentPoll) p.push(currentPoll);
            currentFlash = currentPoll = null;
            section = line;
            return;
          }

          if (section === "---BULLETS---" && line.startsWith("-")) {
            b.push(line.replace(/^-\s*/, ""));
          }

          if (section === "---FLASHCARDS---") {
            const m = line.match(/^([A-Za-zÁÉÍÓÚáéíóúñÑ ]+)[:\-]\s*(.*)$/);
            if (m) {
              if (currentFlash) f.push(currentFlash);
              currentFlash = { title: m[1].trim(), summary: m[2].trim() };
              return;
            }
            if (currentFlash) {
              currentFlash.summary += " " + line;
            }
          }

          if (section === "---POLLS---") {
            const q = line.match(/^\d+[\.\)]\s*(.*)$/);
            if (q) {
              if (currentPoll) p.push(currentPoll);
              currentPoll = { question: q[1], options: [], votes: [] };
              return;
            }
            if (currentPoll && line.startsWith("-")) {
              currentPoll.options.push(line.replace(/^-\s*/, ""));
              currentPoll.votes.push(0);
            }
          }
        });

        if (currentFlash) f.push(currentFlash);
        if (currentPoll) p.push(currentPoll);

        setBullets(b);
        setFlashcards(f);
        setPolls(p);
      });
  }, [txtUrl, lang]);

  /* ───────── VOTAR POLL ───────── */
  const vote = (pi: number, oi: number) => {
    if (answers[pi] !== undefined) return;
    setAnswers({ ...answers, [pi]: oi });
    setPolls(prev =>
      prev.map((p, i) =>
        i === pi
          ? { ...p, votes: p.votes.map((v, j) => (j === oi ? v + 1 : v)) }
          : p
      )
    );
  };

  /* ───────── DEBATE ACTIONS ───────── */
  const sendComment = async () => {
    const res = await fetch("/api/debate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: commentText,
        anonymous,
        name,
      }),
    });

    const newComment = await res.json();
    setComments(prev => [newComment, ...prev]);
    setCommentText("");
    setName("");
  };

  const likeComment = async (id: number) => {
    await fetch("/api/debate", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });

    setComments(prev =>
      prev.map(c => (c.id === id ? { ...c, likes: c.likes + 1 } : c))
    );
  };

  /* ───────── RENDER ───────── */
  return (
    <article className="max-w-6xl mx-auto px-6 py-20 space-y-28">
      <header>
        <h1 className="text-6xl font-extrabold mb-4">{title}</h1>
        {subtitle && <p className="text-3xl text-gray-600">{subtitle}</p>}
      </header>

      <section>
        <h2 className="text-4xl font-extrabold mb-8">{t.debate}</h2>

        {!anonymous && (
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder={t.name}
            className="w-full mb-4 p-4 rounded-xl border text-lg"
          />
        )}

        <textarea
          value={commentText}
          onChange={e => setCommentText(e.target.value)}
          placeholder={t.placeholder}
          className="w-full p-6 rounded-xl border min-h-[140px] text-lg"
        />

        <label className="flex items-center gap-2 my-4">
          <input
            type="checkbox"
            checked={anonymous}
            onChange={() => setAnonymous(!anonymous)}
          />
          {t.anonymous}
        </label>

        <button
          onClick={sendComment}
          disabled={!commentText.trim()}
          className="px-8 py-4 rounded-full bg-gray-700 text-white font-bold"
        >
          {t.send}
        </button>

        <div className="mt-10 space-y-6">
          {comments.map(c => (
            <div key={c.id} className="bg-gray-100 p-6 rounded-xl">
              <p className="font-semibold">{c.name}</p>
              <p className="mt-2">{c.text}</p>
              <button
                onClick={() => likeComment(c.id)}
                className="mt-3 text-sm text-blue-600"
              >
                👍 {c.likes} {t.like}
              </button>
            </div>
          ))}
        </div>
      </section>

      {allArticles?.length > 0 && (
        <RecommendationsGrid
          articles={allArticles}
          currentArticle={article}
        />
      )}
    </article>
  );
}
