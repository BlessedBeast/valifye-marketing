import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${inter.variable} bg-background text-foreground antialiased`}
        suppressHydrationWarning
      >
        <main className="mx-auto max-w-[1280px] px-4 py-8 pt-24 sm:px-6 sm:pt-24 lg:px-8">
          {children}
        </main>
      </body>
    </html>
  );
}
