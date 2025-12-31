'use client'

import { usePathname } from 'next/navigation'
import { Sidebar } from '@/components/navigation/Sidebar'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  // Full-screen routes that should NOT have the sidebar
  const fullScreenRoutes = [
    '/dashboard/3d-builder',
    '/dashboard/overlay-builder',
  ]

  const isFullScreen = fullScreenRoutes.includes(pathname)

  // If full-screen route, render without sidebar
  if (isFullScreen) {
    return <>{children}</>
  }

  // Default layout with sidebar
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}
