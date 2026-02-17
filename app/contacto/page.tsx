"use client";

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
    <section className={`${merriweather.variable} font-sans max-w-5xl mx-auto px-6 py-16 space-y-12 bg-white text-[#0a1b2e]`}>
      <h1 className="text-4xl font-normal text-center">{language === "ES" ? "Contacto" : "Contact"}</h1>

      <div className="bg-gray-100/40 p-8 rounded-2xl shadow-xl shadow-[#0a1b2e]/20">
        <p className="text-lg mb-4 text-center">
          {language === "ES" ? "Cualquier duda escríbenos a:" : "If you have questions, write to us at:"}{" "}
          <a href="mailto:pperiodicodigitalml@gmail.com" className="text-[#0a1b2e] underline">
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
            className="w-full p-3 text-black rounded-lg border border-gray-300 bg-white shadow-sm shadow-[#0a1b2e]/10 focus:ring-2 focus:ring-[#0a1b2e]"
            required
          />

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            className="w-full p-3 text-black rounded-lg border border-gray-300 bg-white shadow-sm shadow-[#0a1b2e]/10 focus:ring-2 focus:ring-[#0a1b2e]"
            required
          />

          <textarea
            name="mensaje"
            placeholder={language === "ES" ? "Tu mensaje" : "Your message"}
            value={formData.mensaje}
            onChange={handleChange}
            className="w-full p-3 text-black rounded-lg border border-gray-300 bg-white shadow-sm shadow-[#0a1b2e]/10 focus:ring-2 focus:ring-[#0a1b2e] h-40 resize-none"
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="bg-[#0a1b2e] text-white px-6 py-3 rounded-xl hover:opacity-90 transition w-full"
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
