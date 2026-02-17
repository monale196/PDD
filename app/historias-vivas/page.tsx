"use client";

import React, { useState, useEffect, useContext, useMemo, createContext } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { LanguageContext } from "../RootProviders";
import { SearchContext } from "@/context/SearchContext";
import { Merriweather } from "next/font/google";

const merriweather = Merriweather({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-merriweather",
});

// --- Interfaces ---
export interface Entrevista {
  id: number;
  titulo: { ES: string; EN: string };
  descripcion: { ES: string; EN: string };
  fecha: string;
  fechaISO: string;
  likes: number;
  videoUrl?: string;
}

// --- Context para entrevistas ---
interface EntrevistasContextType {
  entrevistas: Entrevista[];
}
export const EntrevistasContext = createContext<EntrevistasContextType>({
  entrevistas: [],
});

// --- Formatear tiempo restante ---
function formatCountdown(diffMs: number) {
  const totalSeconds = Math.max(0, Math.floor(diffMs / 1000));
  const days = Math.floor(totalSeconds / (3600 * 24));
  const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${days}d ${hours}h ${minutes}m ${seconds}s`;
}

// --- Componente principal ---
export default function HistoriasVivas() {
  const { language } = useContext(LanguageContext);
  const { dateFilter } = useContext(SearchContext);

  const [entrevistas, setEntrevistas] = useState<Entrevista[]>([]);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [recentLikes, setRecentLikes] = useState(0);
  const [recentDislikes, setRecentDislikes] = useState(0);
  const [userVote, setUserVote] = useState<"like" | "dislike" | null>(null);
  const [loading, setLoading] = useState(true);

  const targetDate = new Date("2026-02-01T00:00:00");
  const [countdown, setCountdown] = useState("");
  const [beforeNewYear, setBeforeNewYear] = useState(true);

  // --- Countdown ---
  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const diff = targetDate.getTime() - now.getTime();
      setBeforeNewYear(diff > 0);
      setCountdown(formatCountdown(diff));
    };
    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  // --- Fetch entrevistas dinámico ---
  useEffect(() => {
    if (beforeNewYear) return;
    fetch("/api/entrevistas")
      .then((res) => res.json())
      .then((data) => setEntrevistas(data?.entrevistas || []))
      .catch(() => setEntrevistas([]))
      .finally(() => setLoading(false));
  }, [beforeNewYear]);

  // --- Artículo reciente ---
  const entrevistaReciente = useMemo(() => {
    if (beforeNewYear || entrevistas.length === 0) return null;
    if (dateFilter) {
      return entrevistas.find((e) => e.fechaISO === dateFilter) || entrevistas[0];
    }
    return [...entrevistas].sort((a, b) => b.fechaISO.localeCompare(a.fechaISO))[0];
  }, [entrevistas, dateFilter, beforeNewYear]);

  const otrasEntrevistas = entrevistas.filter((e) => e !== entrevistaReciente);

  if (loading && !beforeNewYear) {
    return <p className="text-center py-12">{language === "ES" ? "Cargando entrevistas..." : "Loading interviews..."}</p>;
  }

  return (
    <EntrevistasContext.Provider value={{ entrevistas }}>
      <div className={`${merriweather.variable} bg-white min-h-screen text-[#0a1b2e] px-4 md:px-16 py-12 space-y-16`}>

        {/* Countdown si antes del 1 de enero */}
        {beforeNewYear && (
          <section className="bg-gray-100/40 rounded-3xl shadow-lg p-12 flex flex-col items-center justify-center text-center">
            <h1 className="text-3xl md:text-4xl mb-4">{language === "ES" ? "Próximamente entrevistas" : "Interviews coming soon"}</h1>
            <p className="text-lg mb-6">{language === "ES" ? "Las entrevistas se publicarán aquí:" : "Interviews will be published here:"}</p>
            <div className="text-4xl md:text-6xl font-bold text-[#0a1b2e]">{countdown}</div>
          </section>
        )}

        {/* Entrevista reciente */}
        {!beforeNewYear && entrevistaReciente && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-gray-100/30 rounded-3xl shadow-lg p-6 md:p-10 hover:shadow-[#0a1b2e]/50 transition cursor-pointer"
          >
            <h1 className="text-3xl md:text-4xl mb-2">{entrevistaReciente.titulo[language]}</h1>
            <h2 className="text-md md:text-lg text-gray-700 mb-4">{entrevistaReciente.fecha}</h2>

            {entrevistaReciente.videoUrl ? (
              <video className="w-full h-64 md:h-80 rounded-lg mb-4" controls src={entrevistaReciente.videoUrl} />
            ) : (
              <div className="w-full h-64 md:h-80 bg-gray-300 rounded-lg flex items-center justify-center font-semibold text-gray-600 mb-4">
                {language === "ES" ? "Video no disponible" : "Video not available"}
              </div>
            )}

            <p className="text-lg leading-relaxed">{entrevistaReciente.descripcion[language]}</p>

            <div className="flex items-center space-x-4 mt-4">
              <button
                disabled={!!userVote}
                onClick={() => { if (!userVote) { setRecentLikes(recentLikes + 1); setUserVote("like"); } }}
                className="flex items-center space-x-1 px-4 py-2 rounded-md border-2 border-[#0a1b2e] hover:bg-[#0a1b2e]/10 transition"
              >
                👍 <span>{recentLikes + entrevistaReciente.likes}</span>
              </button>
            </div>
          </motion.section>
        )}

        {/* Otras entrevistas */}
        {!beforeNewYear && otrasEntrevistas.length > 0 && (
          <section>
            <h2 className="text-2xl md:text-3xl mb-6">{language === "ES" ? "Otras entrevistas que podrían interesarte" : "Other interviews you might be interested in"}</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {otrasEntrevistas.map((e, idx) => (
                <Link key={e.id} href={`/historias-vivas/${e.id}`} className="group">
                  <motion.div
                    whileHover={{ scale: 1.03, boxShadow: "0 8px 20px rgba(0,0,0,0.15)" }}
                    className="flex flex-col md:flex-row bg-gray-100/30 rounded-2xl shadow-lg p-4 transition cursor-pointer"
                  >
                    <div className="w-full md:w-48 h-32 bg-gray-300 rounded-lg flex items-center justify-center text-gray-600 mb-2 md:mb-0 md:mr-4">
                      {language === "ES" ? "Video" : "Video"}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl mb-1">{e.titulo[language]}</h3>
                      <p className="text-gray-700 text-sm mb-2">{language === "ES" ? "Fecha" : "Date"}: {e.fecha}</p>
                      <p className="text-gray-700 line-clamp-3 mb-2">{e.descripcion[language]}</p>
                      <span className="text-sm text-[#0a1b2e]">👍 {e.likes}</span>
                    </div>
                  </motion.div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {!beforeNewYear && entrevistaReciente === null && (
          <section className="text-center py-12">{language === "ES" ? "No hay entrevistas disponibles" : "No interviews available"}</section>
        )}
      </div>
    </EntrevistasContext.Provider>
  );
}
