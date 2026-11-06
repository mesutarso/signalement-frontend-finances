import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Signalements",
  description: "Traitement des signalements",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fr">
      <body>
        <a
          href="#contenu"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:bg-card focus:px-4 focus:py-2.5 focus:text-sm focus:font-bold focus:text-primary"
        >
          Aller au contenu
        </a>
        {children}
      </body>
    </html>
  );
}
