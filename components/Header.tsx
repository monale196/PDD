"use client";

import React, { useState, useContext, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { SearchContext, LanguageContext } from "../app/RootProviders";
import { NewsContext } from "../context/NewsContext";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  Bars3Icon,
  HomeIcon,
  MagnifyingGlassIcon,
  CalendarIcon,
} from "@heroicons/react/24/outline";

/* =========================
   CONSTANTES
========================= */

const SLUGS: Record<string, string> = {
  Economia: "economia",
  Empleo: "empleo",
  Educacion: "educacion",
  MedioAmbiente: "medio-ambiente",
  Tecnologia: "tecnologia",
  Derechos: "derechos",
  Futuro: "futuro",
  "Historias-Vivas": "historias-vivas",
};

const NEWS_SECTIONS = [
  "Economia",
  "Empleo",
  "Educacion",
  "MedioAmbiente",
  "Tecnologia",
  "Derechos",
  "Futuro",
];

const LABELS: Record<string, Record<string, string>> = {
  ES: {
    menu: "Menú",
    search: "Buscar",
    archive: "Hemeroteca",
    ok: "OK",
    news: "Noticias",
    stories: "Historias por contar",
    contact: "Contacto",
    about: "Quiénes somos",
    searchPlaceholder: "Buscar...",
  },
  EN: {
    menu: "Menu",
    search: "Search",
    archive: "Archive",
    ok: "OK",
    news: "News",
    stories: "Living Stories",
    contact: "Contact",
    about: "About Us",
    searchPlaceholder: "Search...",
  },
};

/* =========================
   COMPONENTE
========================= */

export default function Header() {
  const router = useRouter();
  const { language, setLanguage } = useContext(LanguageContext);
  const { keyword, setKeyword, dateFilter, setDateFilter, clearSearch } =
    useContext(SearchContext);
  const { loadArticles } = useContext(NewsContext);

  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [hemerotecaOpen, setHemerotecaOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(
    dateFilter ? new Date(dateFilter) : new Date()
  );

  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (dateFilter) setSelectedDate(new Date(dateFilter));
  }, [dateFilter]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
        setSearchOpen(false);
        setHemerotecaOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const formattedDate = selectedDate.toLocaleDateString(
    language === "ES" ? "es-ES" : "en-GB",
    { day: "2-digit", month: "short", year: "numeric" }
  );

  const panelAnim = {
    initial: { opacity: 0, y: -6 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -6 },
  };

  const executeSearch = () => {
    if (!keyword.trim()) return;
    router.push(`/buscar?keyword=${encodeURIComponent(keyword)}`);
    setSearchOpen(false);
  };

  const applyDateFilter = () => {
    setDateFilter(selectedDate.toISOString().split("T")[0]);
    setHemerotecaOpen(false);
  };

  const translateSection = (sec: string) => {
    const map: Record<string, string> = {
      Economia: "Economy",
      Empleo: "Employment",
      Educacion: "Education",
      MedioAmbiente: "Environment",
      Tecnologia: "Technology",
      Derechos: "Rights",
      Futuro: "Future",
      "Historias-Vivas": "Living Stories",
    };
    return language === "ES" ? sec : map[sec] || sec;
  };

  /* =========================
     🔥 VOLVER A HOME (con recarga completa de artículos)
========================= */
  const goHome = async () => {
    clearSearch(); // limpia keyword y dateFilter
    await loadArticles(undefined, undefined, undefined, "all"); // fuerza carga de todas las secciones
    router.push("/"); // navega a home solo después de cargar
  };

  /* =========================
     RENDER
========================= */

  return (
    <header
      ref={headerRef}
      className="sticky top-0 z-50 w-full bg-[var(--color-background)] shadow-sm"
    >
      {/* ================= LINEA SUPERIOR ================= */}
      <div className="w-full grid grid-cols-3 items-center py-3 px-8">
        {/* IZQUIERDA */}
        <div className="flex items-center gap-6 justify-start">
          {/* MENU */}
          <div className="relative">
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="flex items-center gap-1 font-semibold hover:text-[var(--color-accent)]"
            >
              <Bars3Icon className="w-5 h-5" />
              {LABELS[language].menu}
            </button>

            <AnimatePresence>
              {menuOpen && (
                <motion.div
                  {...panelAnim}
                  className="absolute top-10 left-0 w-60 bg-white shadow-md rounded p-4 z-50"
                >
                  <p className="font-semibold mb-2">{LABELS[language].news}</p>
                  {NEWS_SECTIONS.map((sec) => (
                    <Link
                      key={sec}
                      href={`/secciones/${SLUGS[sec]}`}
                      className="block py-1 hover:text-[var(--color-accent)]"
                      onClick={() => setMenuOpen(false)}
                    >
                      {translateSection(sec)}
                    </Link>
                  ))}

                  <hr className="my-2" />

                  <Link
                    href="/historias-vivas"
                    className="block py-1 hover:text-[var(--color-accent)]"
                    onClick={() => setMenuOpen(false)}
                  >
                    {LABELS[language].stories}
                  </Link>

                  <hr className="my-2" />

                  <Link
                    href="/contacto"
                    className="block py-1 hover:text-[var(--color-accent)]"
                    onClick={() => setMenuOpen(false)}
                  >
                    {LABELS[language].contact}
                  </Link>

                  <Link
                    href="/quienes-somos"
                    className="block py-1 hover:text-[var(--color-accent)]"
                    onClick={() => setMenuOpen(false)}
                  >
                    {LABELS[language].about}
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* BUSCAR */}
          <div className="relative">
            <button
              onClick={() => setSearchOpen((v) => !v)}
              className="flex items-center gap-1 font-semibold hover:text-[var(--color-accent)]"
            >
              <MagnifyingGlassIcon className="w-5 h-5" />
              {LABELS[language].search}
            </button>

            <AnimatePresence>
              {searchOpen && (
                <motion.div
                  {...panelAnim}
                  className="absolute top-10 left-0 w-60 bg-white shadow-md rounded p-2 z-50"
                >
                  <input
                    type="text"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && executeSearch()}
                    placeholder={LABELS[language].searchPlaceholder}
                    className="w-full border rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* HEMEROTECA */}
          <div className="relative">
            <button
              onClick={() => setHemerotecaOpen((v) => !v)}
              className="flex items-center gap-1 font-semibold hover:text-[var(--color-accent)]"
            >
              <CalendarIcon className="w-5 h-5" />
              {LABELS[language].archive} | {formattedDate}
            </button>

            <AnimatePresence>
              {hemerotecaOpen && (
                <motion.div
                  {...panelAnim}
                  className="absolute top-10 left-0 w-48 bg-white shadow-md rounded p-2 z-50"
                >
                  <input
                    type="date"
                    min="2026-02-21"
                    value={selectedDate.toISOString().split("T")[0]}
                    onChange={(e) => setSelectedDate(new Date(e.target.value))}
                    className="w-full border rounded px-2 py-1"
                  />
                  <button
                    onClick={applyDateFilter}
                    className="mt-2 w-full bg-[var(--color-accent)] text-white py-1 rounded"
                  >
                    {LABELS[language].ok}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* LOGO CENTRADO */}
        <div className="flex justify-center">
          <button onClick={goHome}>
            <Image
              src="/img/logo.png"
              alt="Voices of Tomorrow"
              width={180}
              height={60}
              className="object-contain lg:scale-110"
              priority
            />
          </button>
        </div>

        {/* DERECHA */}
        <div className="flex items-center gap-4 justify-end">
          <button onClick={goHome} className="text-[var(--color-accent)]">
            <HomeIcon className="w-6 h-6" />
          </button>

          <button
            onClick={() => setLanguage(language === "ES" ? "EN" : "ES")}
            className="px-3 py-1 bg-[var(--color-accent)] text-white rounded font-semibold text-sm"
          >
            {language}
          </button>
        </div>
      </div>

      {/* ================= BARRA INFERIOR ================= */}
      <nav className="bg-[var(--color-background)] py-2">
        <div className="w-full flex justify-center gap-12 px-8 text-sm font-medium">
          {NEWS_SECTIONS.map((sec) => (
            <Link
              key={sec}
              href={`/secciones/${SLUGS[sec]}`}
              className="hover:text-[var(--color-accent)]"
            >
              {translateSection(sec)}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
}
