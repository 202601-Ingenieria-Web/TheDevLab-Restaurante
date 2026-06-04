import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '@/app/globals.css';
import { Providers } from '@/components/providers';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'TheDevLab Restaurante',
  description: 'Sistema de gestión de restaurante',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='es' className={inter.variable}>
      <body className="min-h-full flex flex-col font-[var(--font-inter)] bg-[#F8F9FB]">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}