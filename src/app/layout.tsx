import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { CookieConsent } from "@/components/CookieConsent";
import { Navbar } from "@/components/Navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Ome Ita - Videochat Random Italia",
  description:
    "Connettiti con persone a caso in tutta Italia. Videochat e chat testuale anonima e sicura.",
  keywords: ["videochat", "italia", "random", "chat", "omegle italiano", "ome tv italiano"],
  robots: "index, follow",
  manifest: "/manifest.json",
  openGraph: {
    title: "Ome Ita - Videochat Random Italia",
    description: "Incontra persone a caso in tutta Italia. Video e chat anonima.",
    type: "website",
    locale: "it_IT",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Ome Ita",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it">
      <body className={`${inter.className} relative`}>
        <Navbar />
        <main className="relative z-10">{children}</main>
        <CookieConsent />
      </body>
    </html>
  );
}
