import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ಗಣಪತಿ ಪ್ರೋತ್ಸಾಹ ಸ್ಪರ್ಧೆ 2026 — ಕೊಪ್ಪಳ | Ganapathi Protsaha Spardhe 2026 — Koppal",
  description:
    "ಸಾರ್ವಜನಿಕ ಮೌಲ್ಯಮಾಪನ ವೇದಿಕೆ — ಶ್ರೀ ಮಾನ್ಯ, ಬಾಲ ಗಂಗಾಧರ ತಿಲಕ್ ಸಮಿತಿ, ಕೊಪ್ಪಳ | Public Evaluation Portal for Sarvajanik Jana Jagrti Ganapathi Protsaha Spardhe 2026, Koppal.",
  keywords: ["Koppal", "Ganapathi Utsava", "ಗಣಪತಿ ಉತ್ಸವ", "ಕೊಪ್ಪಳ", "Ganesh Chaturthi", "2026", "Evaluation", "ಮೌಲ್ಯಮಾಪನ"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
