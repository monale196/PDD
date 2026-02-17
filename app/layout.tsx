import { Inter } from "next/font/google";
import "./globals.css";
import Header from "../components/Header";
import Footer from "../components/Footer";
import RootProviders from "./RootProviders";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata = {
  title: {
    default: "Voices of Tomorrow",
    template: "%s | Voices of Tomorrow",
  },
  description: "Periódico digital de jóvenes para jóvenes",
  icons: {
    icon: "/favicon.png",
  },
  openGraph: {
    title: "Voices of Tomorrow",
    description: "Periódico digital de jóvenes para jóvenes",
    siteName: "Voices of Tomorrow",
    locale: "es_ES",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body
        className={`${inter.variable} antialiased bg-white text-black min-h-screen flex flex-col`}
      >
        <RootProviders>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </RootProviders>
      </body>
    </html>
  );
}
