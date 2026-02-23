// components/Footer.tsx
export const dynamic = "force-dynamic";

"use client";
import React from "react";

interface FooterProps extends React.HTMLAttributes<HTMLElement> {}

export default function Footer({ className }: FooterProps) {
  return (
    <footer
      className={`bg-[var(--color-foreground)] text-[var(--color-card)] w-full relative z-40 ${className}`}
    >
      <div className="max-w-[95%] mx-auto py-3 md:py-4 flex flex-col md:flex-row justify-between items-center space-y-2 md:space-y-0">

        {/* IZQUIERDA: enlace derechos de autor */}
        <a 
          href="/copyright"
          className="underline hover:text-[var(--color-accent)] transition text-sm md:text-base"
        >
          Contenido reproducido con permiso de El Confidencial
        </a>

        {/* DERECHA: tu texto original */}
        <div className="text-sm md:text-base text-[var(--color-card)]">
          © Voices of Tomorrow {new Date().getFullYear()}. España
        </div>

      </div>
    </footer>
  );
}
