import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Providers } from "@/components/Providers";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Lantern Ledger",
  description: "A compact Base Mini App for logging onchain harbor signals.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <head>
        <meta
          name="base:app_id"
          content="6a252f2e30286f927ea9b490"
        />
        <meta
          name="talentapp:project_verification"
          content="6720cd4aad90dcbb294a8cfe4ca55f6880b078c9b2d49b3a4b1744b9a049eea618cb8c2975808e68b7d176360c7374ca2442ee73c3b0a9474d20dceccfcff41a"
        />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
