import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { RootProviders } from '@/components/providers/root-providers';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'AI Story Studio - Cinematic Veo 3 Video Script Generator',
  description:
    'Generate professional, camera-ready, and dialogue-complete video scripts optimized for Veo 3 video models using open-source NVIDIA LLMs.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} dark h-full antialiased`}
      style={{ colorScheme: 'dark' }}
    >
      <body className="text-foreground min-h-full bg-[#0a0a0c] font-sans">
        <RootProviders>{children}</RootProviders>
      </body>
    </html>
  );
}
