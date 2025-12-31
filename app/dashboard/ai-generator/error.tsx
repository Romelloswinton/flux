/**
 * AI Generator Error Handler
 *
 * Handles errors in the AI generation page.
 */

'use client'

import { useEffect } from 'react'
import { ErrorFallback } from '@/components/ErrorFallback'

export default function AIGeneratorError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.error('AI Generator error:', error)
    }
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <ErrorFallback
        error={error}
        resetError={reset}
        title="AI Generator Error"
        message="Failed to load the AI generation interface"
      />
    </div>
  )
}
