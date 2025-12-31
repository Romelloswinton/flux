/**
 * Error Fallback UI Components
 *
 * Specialized fallback UIs for different contexts.
 */

'use client'

import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ErrorFallbackProps {
  error?: Error
  resetError?: () => void
  title?: string
  message?: string
}

/**
 * Generic error fallback
 */
export function ErrorFallback({
  error,
  resetError,
  title = 'Something went wrong',
  message,
}: ErrorFallbackProps) {
  return (
    <div className="flex items-center justify-center min-h-[400px] p-8">
      <div className="text-center max-w-md">
        <AlertTriangle className="w-16 h-16 mx-auto mb-4 text-red-500" />
        <h2 className="text-2xl font-bold mb-2">{title}</h2>
        <p className="text-muted-foreground mb-2">
          {message || error?.message || 'An unexpected error occurred'}
        </p>
        {process.env.NODE_ENV === 'development' && error?.stack && (
          <details className="mt-4 text-left">
            <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground">
              Error details
            </summary>
            <pre className="mt-2 p-4 bg-muted rounded text-xs overflow-auto max-h-40">
              {error.stack}
            </pre>
          </details>
        )}
        <div className="flex gap-3 justify-center mt-6">
          {resetError && (
            <Button onClick={resetError} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          )}
          <Button onClick={() => (window.location.href = '/dashboard')}>
            <Home className="w-4 h-4 mr-2" />
            Go to Dashboard
          </Button>
        </div>
      </div>
    </div>
  )
}

/**
 * 3D Canvas error fallback
 */
export function Canvas3DErrorFallback({ error, resetError }: ErrorFallbackProps) {
  return (
    <div className="flex items-center justify-center h-full bg-gray-900 text-white p-8">
      <div className="text-center max-w-md">
        <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-yellow-500" />
        <h3 className="text-xl font-bold mb-2">3D Canvas Error</h3>
        <p className="text-gray-300 mb-4 text-sm">
          {error?.message || 'Failed to render 3D scene'}
        </p>
        <p className="text-gray-400 text-xs mb-6">
          This might be due to an incompatible model file or WebGL issues.
        </p>
        {resetError && (
          <Button onClick={resetError} variant="secondary" size="sm">
            <RefreshCw className="w-3 h-3 mr-2" />
            Reset Canvas
          </Button>
        )}
      </div>
    </div>
  )
}

/**
 * Model loading error fallback
 */
export function ModelLoadErrorFallback({ error, resetError }: ErrorFallbackProps) {
  return (
    <div className="flex items-center justify-center h-full p-8">
      <div className="text-center max-w-sm">
        <AlertTriangle className="w-10 h-10 mx-auto mb-3 text-orange-500" />
        <h4 className="font-semibold mb-2">Failed to Load Model</h4>
        <p className="text-sm text-muted-foreground mb-4">
          {error?.message || 'The 3D model could not be loaded'}
        </p>
        {resetError && (
          <Button onClick={resetError} size="sm" variant="outline">
            Try Again
          </Button>
        )}
      </div>
    </div>
  )
}

/**
 * Feature error fallback (for smaller features/panels)
 */
export function FeatureErrorFallback({ error, resetError, title }: ErrorFallbackProps) {
  return (
    <div className="flex items-center justify-center p-6 bg-muted/30 rounded-lg border border-border-primary">
      <div className="text-center max-w-xs">
        <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-orange-500" />
        <p className="text-sm font-medium mb-1">{title || 'Feature Error'}</p>
        <p className="text-xs text-muted-foreground mb-3">
          {error?.message || 'This feature encountered an error'}
        </p>
        {resetError && (
          <Button onClick={resetError} size="sm" variant="ghost">
            Retry
          </Button>
        )}
      </div>
    </div>
  )
}
