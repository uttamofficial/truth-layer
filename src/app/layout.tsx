import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'TruthLayer - Keep your knowledge base consistent',
  description: 'AI-powered content consistency and knowledge-health application built on top of Sanity.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#0b0f17] text-slate-100 antialiased selection:bg-indigo-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
