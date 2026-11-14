import type { Metadata } from "next";
import type { ReactNode } from "react";
import { QueryProvider } from "@/shared/lib/query/QueryProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Realtime Voice",
  description: "Next.js + FastAPI starter template",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="ja">
      <body>
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
