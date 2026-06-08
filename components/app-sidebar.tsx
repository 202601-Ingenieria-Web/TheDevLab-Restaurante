'use client';

import * as React from 'react';
import { NavSecondary } from '@/components/nav-secondary';
import { NavUser } from '@/components/nav-user';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  ArrowUpDownIcon,
  BookOpen01Icon,
  UserGroupIcon,
  ShoppingCartIcon,
} from '@hugeicons/core-free-icons';
import { useSession } from 'next-auth/react';

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: session } = useSession();

  const navItems = [
    {
      title: 'Transacciones',
      url: '/transacciones',
      icon: <HugeiconsIcon icon={ArrowUpDownIcon} strokeWidth={2} />,
    },
    {
      title: 'Maestros',
      url: '/maestros',
      icon: <HugeiconsIcon icon={BookOpen01Icon} strokeWidth={2} />,
    },
    {
      title: 'Pedidos',
      url: '/pedidos',
      icon: <HugeiconsIcon icon={ShoppingCartIcon} strokeWidth={2} />,
    },
    ...(session?.user?.role === 'ADMIN'
      ? [
          {
            title: 'Usuarios',
            url: '/users',
            icon: <HugeiconsIcon icon={UserGroupIcon} strokeWidth={2} />,
          },
        ]
      : []),
  ];

  const user = {
    name: session?.user?.name || 'Usuario',
    email: session?.user?.email || '',
    avatar: session?.user?.image ||
      `https://ui-avatars.com/api/?name=${encodeURIComponent(session?.user?.name || 'U')}&background=1e293b&color=fff&size=128`,
    role: session?.user?.role || 'USER',
  };

  return (
    <Sidebar collapsible='offcanvas' {...props}>
      <SidebarHeader className="px-6 py-6 border-b border-stone-100">
        <SidebarMenu>
          <SidebarMenuItem>
            <a href='/' className="flex flex-col gap-0.5">
              <span className="font-serif font-bold text-2xl text-stone-900 tracking-tight">TheDevLab</span>
              <span className="text-[11px] uppercase tracking-widest text-stone-400 font-medium">Restaurante</span>
            </a>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="px-3 py-4">
        <NavSecondary items={navItems} />
      </SidebarContent>
      <SidebarFooter className="border-t border-stone-100 p-4">
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  );
}