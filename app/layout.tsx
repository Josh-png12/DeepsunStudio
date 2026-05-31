import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/lib/i18n";
import AuroraBackground from "@/components/AuroraBackground";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const poppins = Poppins({
  weight: ["400", "500", "600", "700", "800", "900"],
  subsets: ["latin"],
  variable: "--font-poppins",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Joshua Navarro — Full Stack Software Engineer",
  description:
    "Full Stack Software Engineer specializing in systems architecture, backend APIs, and automation tools. Building production-ready software that solves real-world problems.",
  keywords: [
    "Full Stack Developer",
    "Software Engineer",
    "Backend APIs",
    "Automation",
    "Node.js",
    "React",
    "Python",
    "Next.js",
    "Systems Architecture",
  ],
  authors: [{ name: "Joshua Navarro" }],
  creator: "Joshua Navarro",
  openGraph: {
    type: "website",
    locale: "en_US",
    title: "Joshua Navarro — Full Stack Software Engineer",
    description:
      "I design and build production-ready software systems, APIs, automation tools, and interactive web applications.",
    siteName: "Joshua Navarro",
  },
  twitter: {
    card: "summary_large_image",
    title: "Joshua Navarro — Full Stack Software Engineer",
    description:
      "I design and build production-ready software systems, APIs, automation tools, and interactive web applications.",
  },
  robots: { index: true, follow: true },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`dark ${inter.variable} ${poppins.variable} scroll-smooth`}
    >
      <body className="bg-[#08091a] text-slate-100 font-sans antialiased">
        <AuroraBackground />
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}
