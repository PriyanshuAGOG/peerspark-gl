"use client"

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useAuth } from "@/contexts/auth-context"
import { Loader2 } from "lucide-react"
import { AppSidebar } from "@/components/app-sidebar"
import { MobileHeader } from "@/components/mobile-header"
import { MobileNavigation } from "@/components/mobile-navigation"

// This is a new Client Component to handle authentication state and redirection.
export default function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // If the user is not loading and is not logged in, redirect to the login page.
    if (!loading && !user) {
      router.push("/login")
    }
  }, [user, loading, router])

  // While checking for the user, show a loading spinner.
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  // If there's no user, return null while the redirect happens.
  if (!user) {
    return null
  }

  // If the user is authenticated, render the main app layout.
  return (
    <div className="flex h-screen bg-background">
      <AppSidebar />
      <main className="flex-1 overflow-y-auto">
        <MobileHeader />
        {children}
      </main>
      <MobileNavigation />
    </div>
  )
}
