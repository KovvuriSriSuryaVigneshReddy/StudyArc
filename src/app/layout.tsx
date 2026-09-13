import type { Metadata, Viewport } from "next";
import { Outfit, Plus_Jakarta_Sans } from "next/font/google";
import SpatialCursor from "@/components/SpatialCursor";
import "katex/dist/katex.min.css";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: "StudyArc.ai — AI Student Revision Studio",
  description:
    "Eliminate student revision busywork by converting raw lecture materials into structured, high-yield revision cards and an interactive active-recall practice quiz with StudyArc.ai.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`dark ${outfit.variable} ${plusJakarta.variable} w-full max-w-full overflow-x-hidden`}>
      <body className="bg-[#090d16] text-slate-100 antialiased min-h-screen w-full max-w-full overflow-x-hidden font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
        {children}
        <SpatialCursor />
      </body>
    </html>
  );
}

