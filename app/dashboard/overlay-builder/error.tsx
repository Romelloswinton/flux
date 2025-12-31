/**
 * Overlay Builder Error Handler
 *
 * Handles errors in the overlay builder page.
 */

'use client'

import { useEffect } from 'react'
import { ErrorFallback } from '@/components/ErrorFallback'

export default function OverlayBuilderError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.error('Overlay Builder error:', error)
    }
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <ErrorFallback
        error={error}
        resetError={reset}
        title="Overlay Builder Error"
        message="Failed to load the overlay builder interface"
      />
    </div>
  )
}
