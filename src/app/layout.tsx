import type { Metadata } from "next";
import "./globals.css";
import { AppProviders } from "@/components/app-providers";
export const metadata: Metadata = {
  title: "Lifelyn — Your health, remembered.",
  description:
    "One continuous health memory. Bring your records together, understand your history, and control who can see it.",
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body><AppProviders>{children}</AppProviders></body>
    </html>
  );
}
