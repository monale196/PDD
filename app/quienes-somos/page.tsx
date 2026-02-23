"use client";
export const dynamic = "force-dynamic";

import React, { useContext, useState } from "react";
import { LanguageContext } from "../RootProviders";
import { Merriweather } from "next/font/google";
import { motion, AnimatePresence } from "framer-motion";



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
      descriptionES: `Estudiante del Colegio Americano de Madrid cuyo liderazgo se define por una filosofía de base arraigada en el legado, el servicio y el impacto significativo en la comunidad. A sus dieciséis años, no se centra en los títulos, sino en crear sistemas y culturas que le sobrevivan, empoderando a otros para que crezcan y lideren. Impulsado por la innovación, Mikel ve a los jóvenes como arquitectos del futuro y trabaja para remodelar la forma en que su generación se relaciona con las ideas y el poder. Este proyecto, Voices of Tomorrow, encarna esta visión mediante la creación de una plataforma duradera en la que los jóvenes pueden aprender, contribuir y dar forma a las conversaciones que definirán su mundo.`,
      descriptionEN: `Student at the American School of Madrid whose leadership is defined by a ground-up philosophy rooted in legacy, service, and meaningful community impact. At sixteen, he focuses not on titles but on building systems and cultures that outlast him, empowering others to grow and lead. Driven by innovation, Mikel sees young people as architects of the future and works to reshape how his generation engages with ideas and power. This project, Voices of Tomorrow, embodies this vision by creating a lasting platform where youth can learn, contribute, and shape the conversations that will define their world.`
    },
    {
      id: "luis",
      name: "Luis Epaillard García-Cereceda",
      subtitleES: "Co-founder de Voices of Tomorrow",
      subtitleEN: "Co-founder of Voices of Tomorrow",
      img: "/img/Luis.jpg",
      descriptionES: `Es un estudiante de 17 años del Colegio Americano de Madrid impulsado por un fuerte compromiso con el impacto social y el liderazgo. Con una mente curiosa y una visión ambiciosa, entiende la información como una fuerza capaz de dar forma a una generación más consciente y comprometida. Más allá de los logros personales, Luis se dedica a conectar a los jóvenes con las realidades del mundo que se preparan para liderar. En el núcleo del carácter de Luis se encuentra un deseo genuino de aprender, crecer y contribuir con un propósito, abordando cada oportunidad con curiosidad, disciplina y una tranquila determinación. Este proyecto, Voices of Tomorrow, representa el compromiso de Luis de informar y despertar las mentes jóvenes, demostrando que mantenerse al tanto del mundo es el primer paso para crear un impacto real.`,
      descriptionEN: `A 17-year-old student at the American School of Madrid driven by a strong commitment to social impact and leadership. With a curious mind and an ambitious vision, he understands information as a force capable of shaping a more conscious and engaged generation. Beyond personal achievement, Luis is dedicated to connecting young people with the realities of the world they are preparing to lead. At the core of Luis’ character is a genuine desire to learn, grow, and contribute with purpose, approaching every opportunity with curiosity, discipline, and quiet determination. This project, Voices of Tomorrow, represents Luis’ commitment to informing and awakening young minds, proving that staying aware of the world is the first step toward creating real impact.`
    }
  ];

  const panelVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 }
  };

  const ideaPreviewES = "Voices of Tomorrow nació de una verdad simple: siempre nos ha importado cómo funciona el mundo, por qué funciona así y cómo podría funcionar mejor.";
  const ideaPreviewEN = "Voices of Tomorrow was born from a simple truth: we have always cared deeply about how the world works, why it works that way, and how it could work better.";
  const ideaBoldES = "Tu voz. Tu mundo. Tu mañana";
  const ideaBoldEN = "Your voice. Your world. Your tomorrow";

  return (
    <div className={`${merriweather.variable} font-sans bg-white text-[#0a1b2e] min-h-screen px-4 md:px-16 py-12 space-y-16`}>

      <h1 className="text-4xl md:text-5xl text-center mb-8 font-normal">{es ? "Quiénes somos" : "About us"}</h1>

      {/* Cómo nació la idea */}
      <section className="bg-white rounded-2xl p-6 shadow-md flex flex-col md:flex-row items-start gap-6">
        <div className={`flex-1 ${!expandedIdea ? "flex flex-col justify-center h-64" : ""}`}>
          <h2 className="text-2xl mb-4 font-normal">{es ? "¿Cómo nació la idea?" : "Our Story"}</h2>
          
          {/* Preview siempre visible */}
          <p className="text-lg md:text-xl leading-relaxed mb-2">{es ? ideaPreviewES : ideaPreviewEN}</p>
          <p className="text-3xl md:text-4xl font-bold text-center mb-4">{es ? ideaBoldES : ideaBoldEN}</p>

          {/* Texto completo expandido */}
          <AnimatePresence initial={false}>
            {expandedIdea && (
              <motion.div
                key="idea-full"
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={panelVariants}
                className="text-lg md:text-xl leading-relaxed mb-4"
              >
                {es ? (
                  <>
                    <p>Desde apasionadas conversaciones después de clase hasta fundar el club de política de nuestro colegio, descubrimos que nuestra mayor fuerza no era solo el interés en la política, sino la creencia en el discurso civil y el diálogo.</p>
                    <p>Un diálogo que cuestiona ideas sin atacar a las personas, que abre espacio al desacuerdo y reconoce la diversidad de perspectivas como un elemento esencial, no como un inconveniente.</p>
                    <p>No obstante, hemos observado que nuestra generación se muestra cada vez más desencantada con el statu quo político. Los jóvenes están informados, tienen opiniones y desean participar, pero con demasiada frecuencia se enfrentan a ruido en lugar de claridad, polarización en lugar de diálogo, y plataformas que les hablan en lugar de interactuar con ellos.</p>
                    <p><em>Voices of Tomorrow</em> existe para cambiar eso.</p>
                    <p>Creamos este periódico digital para ofrecer un espacio donde los jóvenes puedan acercarse a la política de manera clara, honesta e interesante. Una plataforma donde aprender a pensar sea más importante que que te digan qué pensar.</p>
                    <p>Este proyecto es nuestra respuesta a la creencia de que el futuro lo construyen quienes están dispuestos a hablar y escuchar con intención. Nuestro objetivo no es solo informar sobre el mundo, sino cultivar una generación que se asienta empoderada para cuestionarlo, entenderlo y, finalmente, mejorarlo.</p>
                  </>
                ) : (
                  <>
                    <p>From passionate conversations after class to founding our school’s politics club, we discovered early on that our greatest strength wasn’t just our interest in politics, but our belief in civil discourse and dialogue.</p>
                    <p>A dialogue that challenges ideas without attacking people, that makes space for disagreement and that treats diverse perspectives as essential rather than inconvenient.</p>
                    <p>However we’ve grown to realize our generation has become increasingly disenchanted with the political status quo. Young people are informed, opinionated, and eager to participate, but they are too often met with noise instead of clarity, polarization instead of conversation, and platforms that speak at them rather than with them.</p>
                    <p><em>Voices of Tomorrow</em> exists to change that.</p>
                    <p>We created this digital newspaper to offer a space where young people can access politics in a way that feels approachable, honest, and intellectually engaging. A platform where learning how to think matters more than being told what to think.</p>
                    <p>This project is our answer to the belief that the future is built by those willing to speak and listen with intention. Our goal is not simply to report on the world, but to cultivate a generation that feels empowered to question it, understand it, and ultimately improve it.</p>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          <button className="text-[#0a1b2e] font-normal underline text-sm" onClick={() => setExpandedIdea(!expandedIdea)}>
            {expandedIdea ? (es ? "Leer menos" : "Show less") : (es ? "Leer más" : "Read more")}
          </button>
        </div>

        <div className="flex justify-center w-full md:w-1/2">
          <img src="/img/logoquienessomos.png" alt={es ? "Logo Quiénes somos" : "About us Logo"} className="w-full max-w-md h-auto object-contain rounded-lg" />
        </div>
      </section>

      {/* Nuestra visión */}
      <section className="flex justify-center">
        <div className="rounded-3xl p-8 max-w-4xl bg-gray-200/20" style={{ boxShadow: "0 4px 12px rgba(10,27,46,0.4)" }}>
          <h2 className="text-2xl mb-4 text-center font-normal">{es ? "Nuestra visión" : "Our Vision"}</h2>
          <p className="text-lg md:text-xl leading-relaxed text-center text-[#0a1b2e]">
            {es ? "Una generación empoderada para transformar la curiosidad en claridad, las opiniones en diálogo y la participación en cambio real." : "A generation empowered to turn curiosity into clarity, opinions into dialogue, and engagement into real change."}
          </p>
        </div>
      </section>

      {/* Conoce al equipo */}
      <section className="space-y-12">
        <h2 className="text-2xl md:text-3xl text-center font-normal mb-8">{es ? "Conoce al equipo" : "Meet the Team"}</h2>
        <div className="grid md:grid-cols-2 gap-10">
          {teamMembers.map(member => {
            const expanded = expandedTeam[member.id];
            const text = es ? member.descriptionES : member.descriptionEN;
            return (
              <div key={member.id} className="flex flex-col items-center space-y-4 p-6 rounded-2xl bg-white shadow-md">
                <img src={member.img} alt={member.name} className="w-56 h-56 rounded-full object-cover" />
                <h3 className="text-xl text-[#0a1b2e] font-normal">{member.name}</h3>
                <p className="text-center text-md text-gray-700 italic -mt-2">{es ? member.subtitleES : member.subtitleEN}</p>
                {!expanded && <p className="text-center text-lg text-[#0a1b2e] leading-relaxed mb-2 line-clamp-2">{text}</p>}
                <AnimatePresence initial={false}>
                  {expanded && (
                    <motion.p key={member.id} initial="hidden" animate="visible" exit="exit" variants={panelVariants} className="text-center text-lg text-[#0a1b2e] leading-relaxed mb-2">
                      {text}
                    </motion.p>
                  )}
                </AnimatePresence>
                <button className="text-[#0a1b2e] font-normal underline text-sm" onClick={() => toggleTeam(member.id)}>
                  {expanded ? (es ? "Leer menos" : "Show less") : (es ? "Leer más" : "Read more")}
                </button>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
