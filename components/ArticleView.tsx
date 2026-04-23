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
};

export default function ArticleView({ article, allArticles }: any) {
  const { language } = useContext(LanguageContext);
  const lang = language.toLowerCase() as "es" | "en";
  const t = labels[lang];

  /* ───────── CLAVE ÚNICA DEL DEBATE ───────── */
  const articleId = article.url || article.txtUrl;

  /* ───────── CONTENIDO ───────── */
  const [bullets, setBullets] = useState<string[]>([]);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [polls, setPolls] = useState<Poll[]>([]);
  const [answers, setAnswers] = useState<Record<number, number>>({});

  /* ───────── DEBATE ───────── */
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

  /* ───────── PARSE TXT (IGUAL QUE ANTES) ───────── */
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
            const m = line.match(/^(.+?)\s*[:\-]\s*(.+)$/);
            if (m) {
              if (currentFlash) f.push(currentFlash);
              currentFlash = { title: m[1].trim(), summary: m[2].trim() };
              return;
            }
            if (currentFlash) currentFlash.summary += " " + line;
          }

          if (section === "---POLLS---") {
            const q = line.match(/^\d+[\.\)]\s*(.+)$/);
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

  /* ───────── CARGAR DEBATE ───────── */
  useEffect(() => {
    fetch(`/api/debate?articleId=${encodeURIComponent(articleId)}`)
      .then(r => r.json())
      .then(setComments);
  }, [articleId]);

  /* ───────── ACCIONES ───────── */
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

  const sendComment = async () => {
    const res = await fetch("/api/debate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        articleId,
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

  const likeComment = async (commentId: number) => {
    await fetch("/api/debate", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ articleId, commentId }),
    });

    setComments(prev =>
      prev.map(c =>
        c.id === commentId ? { ...c, likes: c.likes + 1 } : c
      )
    );
  };

  /* ───────── RENDER ───────── */
  return (
    <article className="max-w-6xl mx-auto px-6 py-20 space-y-28">
      {/* HEADER */}
      <header>
        <h1 className="text-6xl font-extrabold mb-4">{title}</h1>
        {subtitle && <p className="text-3xl text-gray-600">{subtitle}</p>}
      </header>

      {/* EN BREVE + IMAGEN */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-gray-300/50 rounded-3xl p-8 shadow-xl">
          <h3 className="font-extrabold text-3xl mb-4">{t.brief}</h3>
          <ul className="list-disc list-inside space-y-3 text-lg">
            {bullets.map((b, i) => <li key={i}>{b}</li>)}
          </ul>
        </div>
        <div className="rounded-3xl shadow-xl overflow-hidden">
          <img src={imageUrl} className="w-full h-full object-cover" />
        </div>
      </div>

      {/* FLASHCARDS */}
      {flashcards.length > 0 && (
        <section>
          <h2 className="text-4xl font-extrabold mb-14">{t.why}</h2>
          <div className="grid md:grid-cols-3 gap-12">
            {flashcards.map((c, i) => (
              <motion.div key={i} whileHover={{ scale: 1.07 }} className="bg-white rounded-3xl p-12 text-center shadow-xl">
                <img src={iconMap[c.title] || "/icons/Future.png"} className="w-24 h-24 mx-auto mb-8" />
                <h3 className="font-bold text-2xl mb-5">{c.title}</h3>
                <p className="text-gray-600 text-lg">{c.summary}</p>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* POLLS */}
      {polls.length > 0 && (
        <section>
          <h2 className="text-4xl font-extrabold mb-14">{t.opinion}</h2>
          <div className="grid md:grid-cols-2 gap-12">
            {polls.map((poll, pi) => {
              const max = Math.max(...poll.votes, 0);
              return (
                <div key={pi} className="bg-white p-12 rounded-3xl shadow-xl">
                  <p className="text-2xl font-semibold mb-10 text-center">{poll.question}</p>
                  <div className="flex gap-6 justify-center">
                    {poll.options.map((o, oi) => (
                      <div key={oi} className="text-center">
                        <button
                          disabled={answers[pi] !== undefined}
                          onClick={() => vote(pi, oi)}
                          className="px-10 py-5 rounded-full bg-blue-100 text-blue-700 font-bold"
                        >
                          {o}
                        </button>
                        {max > 0 && (
                          <p className="mt-2 text-sm text-gray-600">
                            {poll.votes[oi]} {t.votes}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* DEBATE */}
      <section>
        <h2 className="text-4xl font-extrabold mb-8">{t.debate}</h2>

        {!anonymous && (
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder={t.name}
            className="w-full mb-6 p-5 rounded-xl border text-xl"
          />
        )}

        <textarea
          value={commentText}
          onChange={e => setCommentText(e.target.value)}
          placeholder={t.placeholder}
          className="w-full p-6 rounded-xl border min-h-[160px] text-xl mb-6"
        />

        <label className="flex items-center gap-3 mb-8 text-lg">
          <input type="checkbox" checked={anonymous} onChange={() => setAnonymous(!anonymous)} />
          {t.anonymous}
        </label>

        <button
          onClick={sendComment}
          disabled={!commentText.trim()}
          className="px-10 py-5 rounded-full bg-gray-500 text-white font-bold"
        >
          {t.send}
        </button>

        <div className="mt-10 space-y-6">
          {comments.map(c => (
            <div key={c.id} className="bg-gray-100 p-6 rounded-xl">
              <p className="font-semibold">{c.name}</p>
              <p className="mt-2">{c.text}</p>
              <button onClick={() => likeComment(c.id)} className="mt-3 text-sm text-blue-600">
                👍 {c.likes} {t.like}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* RECOMMENDATIONS */}
      {allArticles?.length > 0 && (
        <RecommendationsGrid articles={allArticles} currentArticle={article} />
      )}
    </article>
  );
}