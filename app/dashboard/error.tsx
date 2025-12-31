/**
 * Dashboard Error Handler
 *
 * Handles errors within the dashboard area.
 */

'use client'

import { useEffect } from 'react'
import { ErrorFallback } from '@/components/ErrorFallback'

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.error('Dashboard error:', error)
    }
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <ErrorFallback
        error={error}
        resetError={reset}
        title="Dashboard Error"
        message="An error occurred while loading the dashboard"
      />
    </div>
  )
}
