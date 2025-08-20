"use client"

import type React from "react"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { MobileNavigation } from "@/components/mobile-navigation"
import { Toaster } from "@/components/ui/toaster"
import { useAuth } from "@/contexts/auth-context"
import { Loader2 } from "lucide-react"

function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!user) {
    return null // or a redirect component
  }

  return <>{children}</>
}

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <AuthenticatedLayout>
        <div className="flex min-h-screen w-full">
          {/* Desktop Sidebar */}
          <AppSidebar className="hidden md:flex" />

          {/* Main Content */}
          <main className="flex-1 overflow-hidden">{children}</main>

          {/* Mobile Navigation */}
          <MobileNavigation />
        </div>
        <Toaster />
      </AuthenticatedLayout>
    </SidebarProvider>
  )
}
