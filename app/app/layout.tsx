import AuthenticatedLayout from './authenticated-layout'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  // This layout now just wraps the client-side authenticated layout.
  // The beta access gate has been removed per user request.
  return <AuthenticatedLayout>{children}</AuthenticatedLayout>
}
