'use client';

import { Inter } from 'next/font/google';
import { TooltipProvider } from '@/components/ui/tooltip';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { Toaster } from '@/components/ui/sonner';
import { SessionProvider } from 'next-auth/react';

const inter = Inter({ subsets: ['latin'] });

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <TooltipProvider>
        <SidebarProvider
          style={
            {
              '--sidebar-width': '260px',
              '--header-height': 'calc(var(--spacing) * 12)',
            } as React.CSSProperties
          }
        >
          <div className={inter.className} style={{ display: 'contents' }}>
            <AppSidebar variant='inset' />
            <SidebarInset className="bg-[#F8F9FB]">
              {/* Header móvil con hamburguesa */}
              <header className="flex items-center gap-3 px-4 py-3 border-b border-stone-200 bg-white md:hidden">
                <SidebarTrigger className="text-stone-600" />
                <span className="font-serif font-bold text-stone-900">TheDevLab</span>
              </header>
              {children}
              <Toaster richColors />
            </SidebarInset>
          </div>
        </SidebarProvider>
      </TooltipProvider>
    </SessionProvider>
  );
}