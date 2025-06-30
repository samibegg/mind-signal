// 2. Replace the content of your app/layout.js with this:
import { IBM_Plex_Mono } from "next/font/google";
import Providers from "@/components/Providers";
import "./globals.css";

const plexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-plex-mono',
});

// The metadata object is now correctly exported from a Server Component.
export const metadata = {
  title: 'Mind Signal',
  description: 'High-impact note-taking for high-speed minds',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body className={plexMono.variable}>
        {/* The Providers component now handles the client-side SessionProvider */}
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
