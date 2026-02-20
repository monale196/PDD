"use client";

import React, { useContext, useState } from "react";
import { LanguageContext } from "../RootProviders";
import { Merriweather } from "next/font/google";
import { motion } from "framer-motion";

const merriweather = Merriweather({ subsets: ["latin"], weight: "400", variable: "--font-merriweather" });

export default function QuienesSomos() {
  const { language } = useContext(LanguageContext);
  const es = language === "ES";

  const [expandedIdea, setExpandedIdea] = useState(false);
  const [expandedTeam, setExpandedTeam] = useState<{ [key: string]: boolean }>({});

  const toggleTeam = (key: string) => setExpandedTeam(prev => ({ ...prev, [key]: !prev[key] }));

  const teamMembers = [
    {
      id: "mikel",
      name: "Mikel García Mondragón",
      subtitleES: "Co-founder de Voices of Tomorrow",
      subtitleEN: "Co-founder of Voices of Tomorrow",
      img: "/img/Mikel.jpg",
      descriptionES: "Estudiante del Colegio Americano de Madrid cuyo liderazgo se define por una filosofía de base arraigada en el legado, el servicio y el impacto significativo en la comunidad...",
      descriptionEN: "Student at the American School of Madrid whose leadership is defined by a ground-up philosophy rooted in legacy, service, and meaningful community impact..."
    },
    {
      id: "luis",
      name: "Luis Epaillard García-Cereceda",
      subtitleES: "Co-founder de Voices of Tomorrow",
      subtitleEN: "Co-founder of Voices of Tomorrow",
      img: "/img/Luis.jpg",
      descriptionES: "Es un estudiante de 17 años del Colegio Americano de Madrid impulsado por un fuerte compromiso con el impacto social y el liderazgo...",
      descriptionEN: "A 17-year-old student at the American School of Madrid driven by a strong commitment to social impact and leadership..."
    }
  ];

  return (
    <div className={`${merriweather.variable} font-sans bg-white text-[var(--color-foreground)] min-h-screen px-6 md:px-16 py-12 space-y-16`}>

      <h1 className="text-4xl md:text-5xl text-center mb-8 font-normal">{es ? "Quiénes somos" : "About us"}</h1>

      {/* Cómo nació la idea */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-[var(--color-card)] rounded-2xl p-6 shadow-md flex flex-col md:flex-row items-start gap-6"
      >
        <div className="flex-1">
          <h2 className="text-2xl mb-4 font-normal">{es ? "¿Cómo nació la idea?" : "Our Story"}</h2>
          <div className={`text-lg md:text-xl leading-relaxed mb-4 ${expandedIdea ? "" : "line-clamp-6"}`}>
            <p className="mb-4">{es ? "Voices of Tomorrow nació de una verdad simple..." : "Voices of Tomorrow was born from a simple truth..."}</p>
            <h3 className="text-2xl md:text-2xl text-center font-normal mt-6">{es ? "Tu voz. Tu mundo. Tu mañana" : "Your voice. Your world. Your tomorrow"}</h3>
          </div>
          <button className="text-[var(--color-foreground)] font-normal underline text-sm" onClick={() => setExpandedIdea(!expandedIdea)}>
            {expandedIdea ? (es ? "Leer menos" : "Show less") : (es ? "Leer más" : "Read more")}
          </button>
        </div>
        <div className="flex justify-center w-full md:w-1/2">
          <img src="/img/logoquienessomos.jpg" alt={es ? "Logo Quiénes somos" : "About us Logo"} className="w-full max-w-md h-auto object-contain rounded-lg shadow-md" />
        </div>
      </motion.section>

      {/* Nuestra visión */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="flex justify-center"
      >
        <div className="rounded-3xl p-8 max-w-4xl bg-[var(--color-card)] shadow-md">
          <h2 className="text-2xl mb-4 text-center font-normal">{es ? "Nuestra visión" : "Our Vision"}</h2>
          <p className="text-lg md:text-xl leading-relaxed text-center">{es ? "Una generación empoderada..." : "A generation empowered..."}</p>
        </div>
      </motion.section>

      {/* Conoce al equipo */}
      <section className="space-y-12">
        <h2 className="text-2xl md:text-3xl text-center font-normal mb-8">{es ? "Conoce al equipo" : "Meet the Team"}</h2>

        <div className="grid md:grid-cols-2 gap-10">
          {teamMembers.map(member => {
            const expanded = expandedTeam[member.id];
            const text = es ? member.descriptionES : member.descriptionEN;
            return (
              <motion.div
                key={member.id}
                whileHover={{ scale: 1.03, boxShadow: "0 8px 20px rgba(0,0,0,0.15)" }}
                className="flex flex-col items-center space-y-4 p-6 rounded-2xl bg-[var(--color-card)] shadow-md"
              >
                <img src={member.img} alt={member.name} className="w-56 h-56 rounded-full object-cover shadow-md" />
                <h3 className="text-xl text-[var(--color-foreground)] font-normal">{member.name}</h3>
                <p className="text-center text-md text-[var(--color-gray)] italic -mt-2">{es ? member.subtitleES : member.subtitleEN}</p>
                <p className={`text-center text-lg text-[var(--color-foreground)] leading-relaxed mb-2 ${!expanded ? "line-clamp-2" : ""}`}>{text}</p>
                <button className="text-[var(--color-foreground)] font-normal underline text-sm" onClick={() => toggleTeam(member.id)}>
                  {expanded ? (es ? "Leer menos" : "Show less") : (es ? "Leer más" : "Read more")}
                </button>
              </motion.div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
