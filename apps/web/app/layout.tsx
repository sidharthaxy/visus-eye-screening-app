import type { Metadata, Viewport } from "next";
import { Figtree } from "next/font/google";
import { Suspense } from "react";

import { PhoneFrame } from "@/components/PhoneFrame";
import { Providers } from "@/components/Providers";

import "./globals.css";

const figtree = Figtree({ variable: "--font-figtree", subsets: ["latin"], weight: ["400", "500", "600", "700", "800"] });

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
    <html lang="en" className={`${figtree.variable} antialiased`}>
      <body>
        <PhoneFrame>
          <Suspense>
            <Providers>{children}</Providers>
          </Suspense>
        </PhoneFrame>
      </body>
    </html>
  );
}
