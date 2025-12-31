/**
 * 3D Builder Error Handler
 *
 * Handles errors in the 3D builder page.
 */

'use client'

import { useEffect } from 'react'
import { ErrorFallback } from '@/components/ErrorFallback'

export default function ThreeDBuilderError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.error('3D Builder error:', error)
    }
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <ErrorFallback
        error={error}
        resetError={reset}
        title="3D Builder Error"
        message="Failed to load the 3D builder interface"
      />
    </div>
  )
}
