// 4. app/layout.js (UPDATED)
'use client';

import { IBM_Plex_Mono } from "next/font/google";
import { SessionProvider } from "next-auth/react";
import "./globals.css";

// Configure the terminal-style font
const plexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-plex-mono', // CSS variable for Tailwind
});

// RootLayout now wraps the app in a SessionProvider
export default function RootLayout({ children, session }) {
  return (
    <html lang="en" className="dark">
      <body className={plexMono.variable}>
        <SessionProvider session={session}>
            {children}
        </SessionProvider>
      </body>
    </html>
  );
}
