import type { Metadata } from "next";
import { Inter, Source_Code_Pro, Press_Start_2P } from "next/font/google";
import { Toaster } from "sonner";
import { RootProvider } from "./rootProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Waifuverse",
  description: "Collect and battle waifus in an AR adventure game on Solana",
};

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const sourceCodePro = Source_Code_Pro({
  variable: "--font-source-code-pro",
  subsets: ["latin"],
});

const pressStart2P = Press_Start_2P({
  variable: "--font-press-start",
  subsets: ["latin"],
  weight: "400",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <RootProvider>
      <html lang="en">
        <body className={`${inter.variable} ${sourceCodePro.variable} ${pressStart2P.variable}`}>
          {children}
          <Toaster position="top-center" richColors />
        </body>
      </html>
    </RootProvider>
  );
}
