import type { ReactNode } from "react"
import { SidebarProvider, Sidebar, SidebarInset } from "@/components/ui/sidebar"
import { DashboardSidebar } from "@/components/layout/dashboard-sidebar"
import { DashboardHeader } from "@/components/layout/dashboard-header"
import { ChatbotWidget } from "@/components/chatbot-widget"

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <Sidebar>
        <DashboardSidebar />
      </Sidebar>
      <SidebarInset>
        <div className="flex flex-col h-full">
          <DashboardHeader />
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
          <ChatbotWidget />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
