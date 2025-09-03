
"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Home,
  Newspaper,
  Image as ImageIcon,
  Users,
  Settings,
} from "lucide-react"

import {
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarSeparator,
} from "@/components/ui/sidebar"
import { Button } from "../ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import Logo from "../logo"

const menuItems = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/posts", label: "Posts", icon: Newspaper },
  { href: "/media", label: "Media", icon: ImageIcon },
  { href: "/users", label: "Users", icon: Users },
]

const bottomMenuItems = [
    { href: "/settings", label: "Settings", icon: Settings },
];

export function DashboardSidebar() {
  const pathname = usePathname()

  return (
    <>
      <SidebarHeader>
        <div className="flex items-center gap-2 p-2">
          <Logo />
          <span className="text-lg font-semibold font-headline">Modern Chyrp</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.label}>
              <SidebarMenuButton
                asChild
                isActive={pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))}
                tooltip={item.label}
              >
                <Link href={item.href}>
                  <item.icon />
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarSeparator />
      <SidebarContent className="flex-none">
        <SidebarMenu>
            {bottomMenuItems.map((item) => (
                <SidebarMenuItem key={item.label}>
                <SidebarMenuButton
                    asChild
                    isActive={pathname.startsWith(item.href)}
                    tooltip={item.label}
                >
                    <Link href={item.href}>
                    <item.icon />
                    <span>{item.label}</span>
                    </Link>
                </SidebarMenuButton>
                </SidebarMenuItem>
            ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarSeparator />
      <SidebarFooter>
        <div className="flex items-center gap-3 p-2">
            <Avatar>
                <AvatarImage src="https://picsum.photos/100/100" data-ai-hint="user avatar" alt="@shadcn" />
                <AvatarFallback>U</AvatarFallback>
            </Avatar>
            <div className="overflow-hidden">
                <p className="font-semibold truncate">Jane Doe</p>
                <p className="text-xs text-muted-foreground truncate">jane.doe@example.com</p>
            </div>
        </div>
      </SidebarFooter>
    </>
  )
}
