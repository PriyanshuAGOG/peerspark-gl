import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useAuth } from "@/contexts/auth-context"
import { Loader2 } from "lucide-react"
import { AppSidebar } from "@/components/app-sidebar"
import { MobileHeader } from "@/components/mobile-header"
import { MobileNavigation } from "@/components/mobile-navigation"

// Client-side component to handle authentication state
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
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!user) {
    return null // or a redirect, handled by useEffect
  }

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

// Server-side component to handle beta access check
export default function AppLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = cookies()
  const hasAccess = cookieStore.get('peer-spark-beta-access')

  // If the user doesn't have the access cookie, redirect to the waitlist page.
  // This protects all routes under /app/*
  if (hasAccess?.value !== 'granted') {
    redirect('/')
  }

  // If they have access, render the client component that handles auth.
  return <AuthenticatedLayout>{children}</AuthenticatedLayout>
}
