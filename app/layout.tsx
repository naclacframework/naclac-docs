import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { themeBootstrapScript } from "@/components/theme-toggle";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  icons: { icon: "/favicon.svg" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable} antialiased`}
      suppressHydrationWarning
    >
      <head>
        {/* A plain inline script, not next/script's `beforeInteractive` —
            that strategy's injection was confirmed missing entirely on the
            not-found render path (reproduced on multiple unmatched URLs),
            leaving 404 pages unthemed despite the docs promising it's
            always injected regardless of placement. This runs synchronously
            during initial HTML parsing either way, before paint. */}
        <script
          id="theme-bootstrap"
          dangerouslySetInnerHTML={{ __html: themeBootstrapScript }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
