// 4. app/layout.js
'use client';

import { IBM_Plex_Mono } from "next/font/google";
import { SessionProvider } from "next-auth/react";
import "./globals.css";

const plexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-plex-mono',
});

const metadata = {
  title: 'Mind Signal',
  description: 'High-impact note-taking for high-speed minds',
};

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
