import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/organisms/Sidebar";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { CodeInjectionHandler } from "@/components/providers/CodeInjectionHandler";
import { AIListenerProvider } from "@/components/AIListenerProvider";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Project Video",
  description: "Desktop video rendering application powered by Remotion",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${inter.variable} antialiased bg-background text-foreground`}>
        <ThemeProvider>
          <AIListenerProvider>
            <CodeInjectionHandler />
            <div className="flex h-screen overflow-hidden">
              <Sidebar />
              <main className="flex-1 overflow-hidden">
                {children}
              </main>
            </div>
          </AIListenerProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
