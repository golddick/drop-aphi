import type { Metadata } from "next";
import "./globals.css"
import {  Playfair_Display } from "next/font/google"
import localFont from "next/font/local";
import Providers from "@/lib/utils/Providers";

const clashDisplay = localFont({
  src: "../fonts/ClashDisplay-Variable.ttf",
  variable: "--font-clashDisplay",
  weight: "500",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
})

 

export const metadata: Metadata = {
  title: {
    template: "Drop-Aphi",
    default: "Where Creators Write and Developers Integrate.",
  },
  icons: {
    icon: "/drop-logo.jpg",
  },
  description: "To empower developers to embed communication and creators to publish content—seamlessly through a single powerful API.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main>
    <html lang="en">
      <body className={`${clashDisplay.variable} ${playfair.variable}`}>
        <Providers>{children}</Providers>
      </body>
    </html>
    </main>
  );
}

