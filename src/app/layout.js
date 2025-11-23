"use client";
import { useEffect, useState } from "react";
import "./globals.css";
import { Geist, Geist_Mono } from "next/font/google";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export default function RootLayout({ children }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Eliminar la clase amp-mask si existe
    document.body.classList.remove('amp-mask');
    setMounted(true);
    
    // Cambiar el título dinámicamente
    document.title = "4 Soluciones Agrotech SA DECY X";
  }, []);

  if (!mounted) {
    return (
      <html lang="en" suppressHydrationWarning>
        <head>
          <title>4 Soluciones Agrotech SA DECY X</title>
        </head>
        <body>
          <div className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
            {children}
          </div>
        </body>
      </html>
    );
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>Soluciones AgroTech S.A de C.V</title>
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}