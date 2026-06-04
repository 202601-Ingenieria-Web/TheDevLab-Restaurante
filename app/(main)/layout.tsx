'use client';

import { Inter } from 'next/font/google';
import { TooltipProvider } from '@/components/ui/tooltip';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
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
            <SidebarInset>
              {children}
              <Toaster richColors />
            </SidebarInset>
          </div>
        </SidebarProvider>
      </TooltipProvider>
    </SessionProvider>
  );
}