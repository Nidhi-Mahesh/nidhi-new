
"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Home,
  Newspaper,
  Image as ImageIcon,
  Users,
  Settings,
  BookOpen,
  LifeBuoy,
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
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import Logo from "../logo"
import { useAuth } from "@/context/auth-provider"

const menuItems = [
  { href: "/dashboard", label: "Dashboard", icon: Home, adminOnly: false },
  { href: "/posts", label: "Posts", icon: Newspaper, adminOnly: false },
  { href: "/media", label: "Media", icon: ImageIcon, adminOnly: false },
  { href: "/users", label: "Users", icon: Users, adminOnly: true },
  { href: "/blog", label: "View Blog", icon: BookOpen, adminOnly: false, target: "_blank" },
]

const bottomMenuItems = [
    { href: "/settings", label: "Settings", icon: Settings },
    { href: "/support", label: "Support", icon: LifeBuoy },
];

export function DashboardSidebar() {
  const pathname = usePathname()
  const { user } = useAuth();

  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U';
    const names = name.split(' ');
    if (names.length > 1) {
      return `${names[0][0]}${names[names.length - 1][0]}`;
    }
    return name[0];
  }


  return (
    <>
      <SidebarHeader>
        <Link href="/dashboard" className="flex items-center gap-2 p-2">
          <Logo />
          <span className="text-lg font-semibold font-headline">Modern Chyrp</span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {menuItems.map((item) => {
            if (item.adminOnly && user?.role !== 'Admin') {
              return null;
            }
            return (
              <SidebarMenuItem key={item.label}>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))}
                  tooltip={item.label}
                >
                  <Link href={item.href} target={item.target}>
                    <item.icon />
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
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
        <Link href="/settings" className="flex items-center gap-3 p-2">
            <Avatar>
                <AvatarImage src={user?.photoURL || undefined} data-ai-hint="user avatar" alt="User avatar" />
                <AvatarFallback>{getInitials(user?.displayName)}</AvatarFallback>
            </Avatar>
            <div className="overflow-hidden">
                <p className="font-semibold truncate">{user?.displayName || "Anonymous"}</p>
                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            </div>
        </Link>
      </SidebarFooter>
    </>
  )
}
