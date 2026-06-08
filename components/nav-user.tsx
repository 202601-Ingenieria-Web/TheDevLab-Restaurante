"use client"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { HugeiconsIcon } from "@hugeicons/react"
import { Logout01Icon, MoreVerticalCircle01Icon, UserCircle02Icon } from "@hugeicons/core-free-icons"
import { signOut } from "next-auth/react"
import { useRouter } from "next/navigation"

export function NavUser({
  user,
}: {
  user: {
    name: string
    email: string
    avatar: string
    role?: string
  }
}) {
  const router = useRouter();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-3 w-full p-2 rounded-xl hover:bg-stone-50 transition-colors text-left group">
          <Avatar className="h-10 w-10 rounded-xl flex-shrink-0">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback className="rounded-xl bg-stone-800 text-white text-sm font-semibold">
              {user.name?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-stone-900 text-sm font-semibold truncate">{user.name}</p>
            <p className="text-stone-400 text-xs truncate">{user.role === 'ADMIN' ? 'Administrador' : 'Mesero'}</p>
          </div>
          <HugeiconsIcon
            icon={MoreVerticalCircle01Icon}
            strokeWidth={2}
            className="w-4 h-4 text-stone-400 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
          />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="top" align="start" className="w-60 rounded-xl border border-stone-200 shadow-lg">
        <DropdownMenuLabel className="p-0">
          <div className="flex items-center gap-3 px-3 py-3">
            <Avatar className="h-10 w-10 rounded-xl">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback className="rounded-xl bg-stone-800 text-white text-sm font-semibold">
                {user.name?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-semibold text-stone-900">{user.name}</p>
              <p className="text-xs text-stone-400">{user.email}</p>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => router.push('/perfil')}
          className="cursor-pointer mx-1 rounded-lg"
        >
          <HugeiconsIcon icon={UserCircle02Icon} strokeWidth={2} className="w-4 h-4 mr-2" />
          Mi perfil
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => signOut({ callbackUrl: '/' })}
          className="text-red-500 cursor-pointer mx-1 mb-1 rounded-lg focus:text-red-500 focus:bg-red-50"
        >
          <HugeiconsIcon icon={Logout01Icon} strokeWidth={2} className="w-4 h-4 mr-2" />
          Cerrar sesión
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}