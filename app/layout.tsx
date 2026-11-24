import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "sonner";
import "./globals.css";

const inter = Inter({ subsets: ["latin", "greek"] });

export const metadata: Metadata = {
  title: "ΚΕΔ ΟΣΕΚΑ - Ορισμοί Διαιτητών",
  description: "Εφαρμογή Ορισμών Διαιτητών - ΚΕΔ ΟΣΕΚΑ",
  appleWebApp: { capable: true, title: "ΚΕΔ ΟΣΕΚΑ", statusBarStyle: "default" },
  icons: { apple: "/icons/apple-touch-icon.png" },
};

export const viewport: Viewport = {
  themeColor: "#143694",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="el" suppressHydrationWarning>
      <body className={`${inter.className} antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {children}
          <Toaster richColors position="top-center" />
        </ThemeProvider>
      </body>
    </html>
  );
}
