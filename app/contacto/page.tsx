"use client";
export const dynamic = "force-dynamic";

import React, { useState, useContext } from "react";
import { LanguageContext } from "../RootProviders";
import { Merriweather } from "next/font/google";

const merriweather = Merriweather({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-merriweather",
});

export default function ContactoPage() {
  const { language } = useContext(LanguageContext);
  const [formData, setFormData] = useState({ nombre: "", email: "", mensaje: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const mensaje = { text: formData.mensaje, author: formData.nombre, email: formData.email, fecha: new Date().toISOString() };

    try {
      const res = await fetch("/api/contacto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(mensaje),
      });

      setLoading(false);

      if (res.ok) {
        alert(language === "ES" ? "¡Gracias por tu mensaje!" : "Thank you for your message!");
        setFormData({ nombre: "", email: "", mensaje: "" });
      } else {
        alert(language === "ES" ? "Hubo un error. Intenta de nuevo." : "There was an error. Please try again.");
      }
    } catch {
      setLoading(false);
      alert(language === "ES" ? "Hubo un error de conexión." : "Connection error.");
    }
  };

  return (
    <section className={`${merriweather.variable} max-w-5xl mx-auto px-6 md:px-16 py-16 space-y-12 bg-white text-[var(--color-foreground)]`}>
      <h1 className="text-4xl font-normal text-center">{language === "ES" ? "Contacto" : "Contact"}</h1>

      <div className="bg-[var(--color-card)] p-8 rounded-2xl shadow-md shadow-[var(--color-accent)]/20">
        <p className="text-lg mb-4 text-center">
          {language === "ES" ? "Cualquier duda escríbenos a:" : "If you have questions, write to us at:"}{" "}
          <a href="mailto:pperiodicodigitalml@gmail.com" className="text-[var(--color-accent)] underline">
            pperiodicodigitalml@gmail.com
          </a>
        </p>

        <p className="text-lg mb-6 text-center">
          {language === "ES"
            ? "Tu mensaje nos ayuda a mejorar. Déjanos tus comentarios."
            : "Your message helps us improve. Leave your feedback."}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="nombre"
            placeholder={language === "ES" ? "Nombre" : "Name"}
            value={formData.nombre}
            onChange={handleChange}
            className="w-full p-4 text-black rounded-2xl border border-[var(--color-accent)] bg-white shadow-md focus:ring-2 focus:ring-[var(--color-accent)] transition"
            required
          />

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            className="w-full p-4 text-black rounded-2xl border border-[var(--color-accent)] bg-white shadow-md focus:ring-2 focus:ring-[var(--color-accent)] transition"
            required
          />

          <textarea
            name="mensaje"
            placeholder={language === "ES" ? "Tu mensaje" : "Your message"}
            value={formData.mensaje}
            onChange={handleChange}
            className="w-full p-4 text-black rounded-2xl border border-[var(--color-accent)] bg-white shadow-md focus:ring-2 focus:ring-[var(--color-accent)] h-40 resize-none transition"
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="bg-[var(--color-accent)] text-white px-6 py-3 rounded-2xl hover:opacity-90 transition w-full"
          >
            {loading
              ? language === "ES" ? "Enviando..." : "Sending..."
              : language === "ES" ? "Enviar" : "Send"}
          </button>
        </form>
      </div>
    </section>
  );
}
