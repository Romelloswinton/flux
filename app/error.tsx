/**
 * Root Error Handler
 *
 * Handles errors at the root level of the application.
 */

'use client'

import { useEffect } from 'react'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Root error:', error)
    }
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-background">
      <div className="text-center max-w-lg">
        <AlertTriangle className="w-20 h-20 mx-auto mb-6 text-red-500" />
        <h1 className="text-3xl font-bold mb-3">Oops! Something went wrong</h1>
        <p className="text-muted-foreground mb-2 text-lg">
          {error.message || 'An unexpected error occurred'}
        </p>
        <p className="text-sm text-muted-foreground mb-8">
          We apologize for the inconvenience. Please try again or return to the dashboard.
        </p>

        {process.env.NODE_ENV === 'development' && error.stack && (
          <details className="mb-8 text-left">
            <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground mb-2">
              Show error details (development only)
            </summary>
            <pre className="p-4 bg-muted rounded text-xs overflow-auto max-h-60 border border-border-primary">
              {error.stack}
            </pre>
          </details>
        )}

        <div className="flex gap-4 justify-center">
          <Button onClick={reset} size="lg">
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
          <Button
            onClick={() => (window.location.href = '/dashboard')}
            variant="outline"
            size="lg"
          >
            <Home className="w-4 h-4 mr-2" />
            Go to Dashboard
          </Button>
        </div>
      </div>
    </div>
  )
}
