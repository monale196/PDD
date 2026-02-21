"use client";

import React, { useState, useContext, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { SearchContext, LanguageContext } from "../app/RootProviders";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { Bars3Icon, HomeIcon, MagnifyingGlassIcon, CalendarIcon } from "@heroicons/react/24/outline";

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

export default function Header() {
  const router = useRouter();
  const { language, setLanguage } = useContext(LanguageContext);
  const { keyword, setKeyword, dateFilter, setDateFilter } = useContext(SearchContext);

  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [hemerotecaOpen, setHemerotecaOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(dateFilter ? new Date(dateFilter) : new Date());
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

  const formattedDate = selectedDate.toLocaleDateString(language === "ES" ? "es-ES" : "en-GB", { day: "2-digit", month: "short", year: "numeric" });
  const panelAnim = { initial: { opacity: 0, y: -6 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -6 } };

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
    return map[sec] || sec;
  };

  return (
    <header ref={headerRef} className="sticky top-0 z-50 bg-[var(--color-background)] shadow-sm w-full">

      {/* ================= LINEA SUPERIOR ================= */}
      <div className="max-w-[1200px] mx-auto flex items-center justify-between py-3 px-6">

        {/* IZQUIERDA */}
        <div className="flex items-center gap-6">

          {/* MENU */}
          <div className="relative">
            <button onClick={() => setMenuOpen(v => !v)} className="flex items-center gap-1 hover:text-[var(--color-accent)]">
              <Bars3Icon className="w-5 h-5"/>
              <span className="font-semibold">Menú</span>
            </button>
            <AnimatePresence>
              {menuOpen && (
                <motion.div {...panelAnim} className="absolute top-10 left-0 w-60 bg-white shadow-md rounded p-4 z-50">
                  <p className="font-semibold mb-2">{language === "ES" ? "Noticias" : "News"}</p>
                  {NEWS_SECTIONS.map(sec => (
                    <Link key={sec} href={`/secciones/${SLUGS[sec]}`} className="block py-1 hover:text-[var(--color-accent)]">
                      {language === "ES" ? sec : translateSection(sec)}
                    </Link>
                  ))}
                  <hr className="my-2"/>
                  <Link href="/historias-vivas" className="block py-1 hover:text-[var(--color-accent)]">
                    {language === "ES" ? "Historias por contar" : "Living Stories"}
                  </Link>
                  <hr className="my-2"/>
                  <Link href="/contacto" className="block py-1 hover:text-[var(--color-accent)]">Contacto</Link>
                  <Link href="/quienes-somos" className="block py-1 hover:text-[var(--color-accent)]">Quiénes somos</Link>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* BUSCAR */}
          <div className="relative">
            <button onClick={() => setSearchOpen(v => !v)} className="flex items-center gap-1 hover:text-[var(--color-accent)]">
              <MagnifyingGlassIcon className="w-5 h-5"/>
              <span className="font-semibold">Buscar</span>
            </button>
            <AnimatePresence>
              {searchOpen && (
                <motion.div {...panelAnim} className="absolute top-10 left-0 w-60 bg-white shadow-md rounded p-2 z-50">
                  <input
                    type="text"
                    value={keyword}
                    onChange={e => setKeyword(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && executeSearch()}
                    placeholder={language === "ES" ? "Buscar..." : "Search..."}
                    className="w-full border rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* HEMEROTECA */}
          <div className="relative">
            <button onClick={() => setHemerotecaOpen(v => !v)} className="flex items-center gap-1 hover:text-[var(--color-accent)]">
              <CalendarIcon className="w-5 h-5"/>
              <span className="font-semibold">Hemeroteca | {formattedDate}</span>
            </button>
            <AnimatePresence>
              {hemerotecaOpen && (
                <motion.div {...panelAnim} className="absolute top-10 left-0 w-48 bg-white shadow-md rounded p-2 z-50">
                  <input
                    type="date"
                    value={selectedDate.toISOString().split("T")[0]}
                    onChange={e => setSelectedDate(new Date(e.target.value))}
                    className="w-full border rounded px-2 py-1"
                  />
                  <button onClick={applyDateFilter} className="mt-2 w-full bg-[var(--color-accent)] text-white py-1 rounded">
                    OK
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>

        {/* CENTRO */}
        <div className="flex-shrink-0 mx-auto">
          <Link href="/">
            <Image src="/img/logo.png" alt="Voices of Tomorrow" width={180} height={60} className="object-contain"/>
          </Link>
        </div>

        {/* DERECHA */}
        <div className="flex items-center gap-4">
          <Link href="/" className="text-[var(--color-accent)]">
            <HomeIcon className="w-6 h-6"/>
          </Link>
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
        <div className="max-w-[1200px] mx-auto flex justify-center gap-12 text-sm font-medium">
          {NEWS_SECTIONS.map(sec => (
            <Link key={sec} href={`/secciones/${SLUGS[sec]}`} className="hover:text-[var(--color-accent)]">
              {language === "ES" ? sec : translateSection(sec)}
            </Link>
          ))}
        </div>
      </nav>

    </header>
  );
}