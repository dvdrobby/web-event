import type { Metadata } from "next";
import { Schibsted_Grotesk, Martian_Mono } from "next/font/google";
import "./globals.css";

import LineWaves from '../components/LineWaves';
import Navbar from "../components/Navbar";

const schibstedGrotesk = Schibsted_Grotesk({
  variable: "--font-schibsted-grotesk",
  subsets: ["latin"],
});

const martianMono = Martian_Mono({
  variable: "--font-martian-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DevEvent",
  description: "The Hub for Every Dev You Musn't Miss Out",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${schibstedGrotesk.variable} ${martianMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#120F17]">
        <Navbar />
        <div className="absolute inset-0 top-0 z-[-1] min-h-screen">
          <LineWaves
            speed={0.1}
            innerLineCount={32}
            outerLineCount={36}
            warpIntensity={1}
            rotation={-45}
            edgeFadeWidth={0}
            colorCycleSpeed={1}
            brightness={0.2}
            color1="#ffffffff"
            color2="#ffffffff"
            color3="#ffffffff"
            enableMouseInteraction
            mouseInfluence={2}
          />
        </div>


        <main>
          {children}
        </main>
      </body>
    </html >
  );
}
