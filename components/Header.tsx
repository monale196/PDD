"use client";

import { useState, useContext, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { SearchContext, LanguageContext } from "../app/RootProviders";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, usePathname } from "next/navigation";

/* =========================
   SLUGS CORRECTOS PARA URL
========================= */
const SLUGS: Record<string, string> = {
  Economia: "economia",
  Empleo: "empleo",
  Educacion: "educacion",
  MedioAmbiente: "medio_ambiente",
  Tecnologia: "tecnologia",
  Derechos: "derechos_democracia",
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

const OTHER_SECTIONS = ["Historias-Vivas"];

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { language, setLanguage } = useContext(LanguageContext);
  const { keyword, setKeyword, dateFilter, setDateFilter } = useContext(SearchContext);

  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [hemerotecaOpen, setHemerotecaOpen] = useState(false);
  const [prevDate, setPrevDate] = useState(dateFilter);

  const [selectedDate, setSelectedDate] = useState<Date>(
    dateFilter ? new Date(dateFilter) : new Date()
  );

  useEffect(() => {
    if (dateFilter) setSelectedDate(new Date(dateFilter));
  }, [dateFilter]);

  const headerRef = useRef<HTMLElement>(null);
  const formattedDate = selectedDate.toLocaleDateString(
    language === "ES" ? "es-ES" : "en-GB",
    { day: "2-digit", month: "short", year: "numeric" }
  );

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) {
        closeAllMenus();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const panelAnim = {
    initial: { opacity: 0, y: -8 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.15 } },
    exit: { opacity: 0, y: -8, transition: { duration: 0.12 } },
  };

  const closeAllMenus = () => {
    setMenuOpen(false);
    setSearchOpen(false);
    setHemerotecaOpen(false);
  };

  const executeSearch = () => {
    if (!keyword.trim()) return;
    setPrevDate(dateFilter);
    router.push(`/buscar?keyword=${encodeURIComponent(keyword.trim())}`);
    setSearchOpen(false);
  };

  const clearSearch = () => {
    setKeyword("");
    if (prevDate) setDateFilter(prevDate);
    router.push("/");
  };

  const applyDateFilter = () => {
    const iso = selectedDate.toISOString().split("T")[0];
    setDateFilter(iso);
    setHemerotecaOpen(false);
  };

  const clearDate = () => {
    const today = new Date();
    setSelectedDate(today);
    setDateFilter(today.toISOString().split("T")[0]);
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
    <header ref={headerRef} className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="w-full relative flex items-center justify-between py-3 md:py-4 px-4 md:px-6">

        {/* IZQUIERDA: Menú, Buscar, Hemeroteca */}
        <div className="flex items-center space-x-6">

          {/* MENÚ */}
          <div className="relative">
            <button onClick={() => setMenuOpen(v => !v)} className="flex items-center space-x-1 text-gray-700 hover:text-black">
              {menuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 5h14M3 10h14M3 15h14" clipRule="evenodd" />
                </svg>
              )}
              <span className="hidden md:inline">{language === "ES" ? "Menú" : "Menu"}</span>
            </button>

            <AnimatePresence>
              {menuOpen && (
                <motion.div {...panelAnim} className="absolute left-0 mt-2 w-56 bg-white border border-gray-300 shadow-lg p-4 z-50 text-gray-800">
                  <p className="font-semibold mb-1">{language === "ES" ? "Noticias" : "News"}</p>
                  <hr className="border-t border-gray-300 mb-2" />
                  <nav className="flex flex-col space-y-1 mb-4">
                    {NEWS_SECTIONS.map(sec => (
                      <Link key={sec} href={`/secciones/${SLUGS[sec]}`} onClick={closeAllMenus} className="hover:text-blue-700">
                        {language === "ES" ? sec : translateSection(sec)}
                      </Link>
                    ))}
                  </nav>

                  <p className="font-semibold mb-1">{language === "ES" ? "Inspiración en acción" : "Inspiration in Action"}</p>
                  <hr className="border-t border-gray-300 mb-2" />
                  <nav className="flex flex-col space-y-1 mb-4">
                    {OTHER_SECTIONS.map(sec => (
                      <Link key={sec} href={`/${SLUGS[sec]}`} onClick={closeAllMenus} className="hover:text-blue-700">
                        {language === "ES" ? sec : translateSection(sec)}
                      </Link>
                    ))}
                  </nav>

                  <p className="font-semibold mb-1">{language === "ES" ? "Otros" : "Others"}</p>
                  <hr className="border-t border-gray-300 mb-2" />
                  <nav className="flex flex-col space-y-1">
                    <Link href="/contacto" onClick={closeAllMenus} className="hover:text-blue-700">{language === "ES" ? "Contacto" : "Contact"}</Link>
                    <Link href="/quienes-somos" onClick={closeAllMenus} className="hover:text-blue-700">{language === "ES" ? "Quiénes somos" : "About Us"}</Link>
                  </nav>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* BUSCAR */}
          <div className="relative">
            <button onClick={() => setSearchOpen(v => !v)} className="flex items-center space-x-1 text-gray-700 hover:text-black">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z" />
              </svg>
              <span className="hidden md:inline">{language === "ES" ? "Buscar" : "Search"}</span>
            </button>

            <AnimatePresence>
              {searchOpen && (
                <motion.div {...panelAnim} className="absolute left-0 mt-2 w-64 bg-white border border-gray-300 shadow-lg p-2 z-50 text-[#0a1b2e]">
                  <input
                    type="text"
                    value={keyword}
                    onChange={e => setKeyword(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); executeSearch(); } }}
                    placeholder={language === "ES" ? "Buscar por palabras clave..." : "Search by keywords..."}
                    className="w-full border border-gray-300 rounded px-2 py-1 text-[#0a1b2e] focus:outline-none focus:ring-1 focus:ring-blue-800"
                  />
                  <button onClick={executeSearch} className="mt-2 w-full bg-blue-800 text-white py-1 rounded hover:bg-blue-900">
                    {language === "ES" ? "Buscar" : "Search"}
                  </button>
                  {keyword.length > 0 && (
                    <button onClick={clearSearch} className="mt-2 w-full bg-red-50 text-red-600 py-1 rounded hover:bg-red-100">
                      {language === "ES" ? "Limpiar búsqueda" : "Clear search"}
                    </button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* HEMEROTECA */}
          <div className="relative">
            <button onClick={() => setHemerotecaOpen(v => !v)} className="flex items-center space-x-1 text-gray-700 hover:text-black">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>{language === "ES" ? "Biblioteca" : "Library"} | {formattedDate}</span>
            </button>

            <AnimatePresence>
              {hemerotecaOpen && (
                <motion.div {...panelAnim} className="absolute left-0 mt-2 w-48 bg-white border border-gray-300 shadow-lg p-2 z-50 text-gray-800">
                  <input
                    type="date"
                    min="2025-12-07"
                    max={new Date().toISOString().split("T")[0]}
                    value={selectedDate.toISOString().split("T")[0]}
                    onChange={e => setSelectedDate(new Date(e.target.value))}
                    className="w-full border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  <button onClick={applyDateFilter} className="mt-2 w-full bg-blue-50 text-blue-700 py-1 rounded hover:bg-blue-100">
                    OK
                  </button>
                  <button onClick={clearDate} className="mt-2 w-full bg-red-50 text-red-600 py-1 rounded hover:bg-red-100">
                    {language === "ES" ? "Limpiar fecha" : "Clear date"}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* LOGO CENTRADO */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none">
          <Link href="/" className="pointer-events-auto">
            <Image src="/img/logo.png" alt="Logo" width={800} height={280} priority className="object-contain h-auto sm:h-12 md:h-14 lg:h-16 xl:h-20 w-auto" />
          </Link>
        </div>

        {/* DERECHA: Home + Idioma */}
        <div className="flex items-center space-x-4">
          <Link href="/" className="text-gray-700 hover:text-black">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 9.5L12 3l9 6.5V21a1 1 0 01-1 1h-5v-6H9v6H4a1 1 0 01-1-1V9.5z" />
            </svg>
          </Link>
          <div className="flex space-x-1">
            <button className="px-2 py-1 rounded text-white bg-[#0a1b2e] hover:bg-[#08152a] font-semibold" onClick={() => setLanguage(language === "ES" ? "EN" : "ES")}>
              {language}
            </button>
          </div>
        </div>
      </div>

      {/* NAV BAR INFERIOR */}
      <nav className="hidden md:flex bg-white border-t border-gray-300 h-14 items-center relative z-10">
        <div className="max-w-[95%] mx-auto flex justify-around">
          {[...OTHER_SECTIONS, ...NEWS_SECTIONS].map(sec => (
            <Link key={sec} href={OTHER_SECTIONS.includes(sec) ? `/${SLUGS[sec]}` : `/secciones/${SLUGS[sec]}`} className="px-4 text-gray-800 hover:text-blue-700 font-medium">
              {language === "ES" ? sec : translateSection(sec)}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
}
