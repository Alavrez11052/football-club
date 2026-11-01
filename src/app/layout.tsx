import type { Metadata } from "next";
import "./globals.css";
import { getClub } from "@/lib/club";

const FONT_STACKS: Record<string, string> = {
  Inter: "Inter, system-ui, sans-serif",
  Roboto: "Roboto, system-ui, sans-serif",
  Oswald: "Oswald, 'Arial Narrow', sans-serif",
  Montserrat: "Montserrat, system-ui, sans-serif",
  "Playfair Display": "'Playfair Display', Georgia, serif",
  Georgia: "Georgia, serif",
};

export async function generateMetadata(): Promise<Metadata> {
  const club = await getClub().catch(() => null);
  return { title: club?.name ? club.name : "Football Club", description: club?.description || "Official website" };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const club = await getClub().catch(() => null);
  const font = club?.font && FONT_STACKS[club.font] ? FONT_STACKS[club.font] : FONT_STACKS.Inter;
  const style = {
    "--club-primary": club?.primaryColor || "#651D32",
    "--club-secondary": club?.secondaryColor || "#171717",
    "--club-font": font,
    "--club-font-display": font,
  } as React.CSSProperties;
  return (
    <html lang="en" style={style}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
