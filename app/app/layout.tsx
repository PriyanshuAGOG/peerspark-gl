import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import AuthenticatedLayout from './authenticated-layout' // Import the new client component

// This is now a pure Server Component.
export default function AppLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = cookies()
  const hasAccess = cookieStore.get('peer-spark-beta-access')

  // This server-side check protects all routes under /app/*
  if (hasAccess?.value !== 'granted') {
    // If the user doesn't have the access cookie, redirect to the waitlist page.
    redirect('/')
  }

  // If they have access, render the client component which will handle auth state.
  return <AuthenticatedLayout>{children}</AuthenticatedLayout>
}
