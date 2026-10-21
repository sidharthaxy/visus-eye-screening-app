import type { Metadata, Viewport } from "next";
import { Figtree, Noto_Sans_Devanagari, Noto_Sans_Oriya } from "next/font/google";
import { Suspense } from "react";

import { Providers } from "@/components/Providers";

import "./globals.css";

const figtree = Figtree({ variable: "--font-figtree", subsets: ["latin"], weight: ["400", "500", "600", "700", "800"] });
// Near reading chart in Hindi and Odia.
const deva = Noto_Sans_Devanagari({ variable: "--font-deva", subsets: ["devanagari"], weight: ["500", "600"], preload: false });
const oriya = Noto_Sans_Oriya({ variable: "--font-oriya", subsets: ["oriya"], weight: ["500", "600"], preload: false });

export const metadata: Metadata = {
  title: "Visus · Quick eye checks",
  description: "Simple guided eye screening tests for sharpness, focus and colour. Screening, not diagnosis.",
};

export const viewport: Viewport = {
  themeColor: "#F7F7F4",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${figtree.variable} ${deva.variable} ${oriya.variable} antialiased`}>
      <body>
        <Suspense>
          <Providers>{children}</Providers>
        </Suspense>
      </body>
    </html>
  );
}
