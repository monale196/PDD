"use client";

import { useContext } from "react";
import { LanguageContext } from "@/app/RootProviders";
import { Merriweather } from "next/font/google";

const merriweather = Merriweather({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-merriweather",
});

export default function CopyrightPage() {
  const { language } = useContext(LanguageContext);
  const es = language === "ES";

  return (
    <div className={`${merriweather.variable} min-h-screen bg-white flex items-center justify-center px-4 py-12`}>
      <div className="bg-[var(--color-card)] border border-[var(--color-accent)]/20 rounded-2xl shadow-md p-8 md:p-12 max-w-6xl w-full">

        {/* Título centrado */}
        <h1 className="text-3xl md:text-4xl text-center text-[var(--color-foreground)] font-semibold mb-10">
          {es ? "Derechos de Autor" : "Copyright / Licensing"}
        </h1>

        {/* Contenido con imagen a la izquierda y texto a la derecha */}
        <div className="flex flex-col md:flex-row items-center md:items-center gap-6 md:gap-10">

          {/* Imagen centrada verticalmente */}
          <div className="flex-shrink-0 md:self-center">
            <img
              src="/img/elconfidencial.jpg"
              alt="El Confidencial"
              className="h-24 w-auto object-contain rounded-md shadow-sm"
            />
          </div>

          {/* Texto principal */}
          <div className="flex-1 text-[var(--color-foreground)] leading-relaxed text-base md:text-lg">
            {es ? (
              <>
                <p className="mb-4">
                  Todo el contenido publicado en esta plataforma es extraído y adaptado 
                  de artículos originales de <span className="font-semibold">El Confidencial</span>, bajo un acuerdo 
                  de autorización para su uso y difusión.
                </p>

                <p className="mb-4">
                  Voices of Tomorrow no reclama propiedad intelectual sobre dichos textos 
                  o imágenes. Todos los derechos pertenecen exclusivamente a sus autores 
                  y titulares originales.
                </p>

                <p className="mb-4">
                  Este sitio tiene fines informativos y experimentales relacionados con 
                  la reescritura y presentación automatizada de contenido.
                </p>

                <p className="mb-4">
                  Cualquier reproducción o distribución externa debe respetar los derechos 
                  de autor y las condiciones establecidas por los titulares originales.
                </p>
              </>
            ) : (
              <>
                <p className="mb-4">
                  All content published on this platform is extracted and adapted
                  from original articles by <span className="font-semibold">El Confidencial</span>, under an agreement
                  authorizing its use and dissemination.
                </p>

                <p className="mb-4">
                  Voices of Tomorrow does not claim intellectual property over these texts 
                  or images. All rights belong exclusively to their original authors 
                  and copyright holders.
                </p>

                <p className="mb-4">
                  This site serves informational and experimental purposes related to 
                  automated rewriting and content presentation.
                </p>

                <p className="mb-4">
                  Any external reproduction or distribution must respect copyright 
                  and the terms established by the original owners.
                </p>
              </>
            )}

            {/* Última actualización */}
            <p className="text-sm text-[var(--color-gray)] mt-6 text-center md:text-left">
              {es ? "Última actualización" : "Last update"}: {new Date().toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
