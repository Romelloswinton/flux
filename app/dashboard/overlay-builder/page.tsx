"use client"

import dynamic from 'next/dynamic'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Save, Loader2, Download, ChevronDown, Check } from 'lucide-react'
import { useProject, useCreateProject, useUpdateProject } from '@/lib/hooks/useProjects'
import { useAuth } from '@/lib/hooks/useAuth'
import { useEffect, useRef, useState, Suspense, useCallback } from 'react'
import type { StoreType } from 'polotno/model/store'

const PolotnoEditor = dynamic(
  () => import('@/components/scene-builder/PolotnoEditor').then((mod) => ({ default: mod.PolotnoEditor })),
  { ssr: false, loading: () => <div className="w-full h-full flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin" /></div> }
)

function OverlayBuilderContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const projectId = searchParams.get('id')

  const storeRef = useRef<StoreType | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [showExportMenu, setShowExportMenu] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null)
  const lastSavedDataRef = useRef<string>('')

  const { user } = useAuth()
  const { data: project, isLoading: isLoadingProject } = useProject(projectId || undefined)
  const createProject = useCreateProject()
  const updateProject = useUpdateProject()

  // Auto-save logic with debouncing
  const performSave = useCallback(async (isManualSave = false) => {
    if (!storeRef.current) {
      console.error('No Polotno store instance')
      return
    }

    const snapshot = storeRef.current.toJSON()
    const currentData = JSON.stringify(snapshot)

    // Skip if data hasn't changed (unless manual save)
    if (!isManualSave && currentData === lastSavedDataRef.current) {
      return
    }

    setIsSaving(true)

    try {
      if (projectId && project) {
        await updateProject.mutateAsync({
          id: projectId,
          updates: {
            project_data: snapshot as any,
            updated_at: new Date().toISOString(),
          },
        })
      } else {
        if (!user) {
          alert('You must be logged in to save projects')
          return
        }

        const newProject = await createProject.mutateAsync({
          owner_id: user.id,
          name: 'Untitled Overlay',
          canvas_width: 1920,
          canvas_height: 1080,
          canvas_background_color: '#000000',
          project_data: snapshot as any,
        })

        router.replace(`/dashboard/overlay-builder?id=${newProject.id}`)
      }

      lastSavedDataRef.current = currentData
      setHasUnsavedChanges(false)
      setLastSaved(new Date())
    } catch (error) {
      console.error('Save failed:', error)
      if (isManualSave) {
        alert('Failed to save project.')
      }
    } finally {
      setIsSaving(false)
    }
  }, [projectId, project, user, updateProject, createProject, router])

  // Auto-save on store changes (debounced)
  useEffect(() => {
    if (!storeRef.current) return

    const handleChange = () => {
      setHasUnsavedChanges(true)

      // Clear existing timer
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current)
      }

      // Set new timer for auto-save (3 seconds)
      autoSaveTimerRef.current = setTimeout(() => {
        performSave(false)
      }, 3000)
    }

    const unsubscribe = storeRef.current.on('change', handleChange)

    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe()
      }
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current)
      }
    }
  }, [storeRef.current, performSave])

  const handleSave = async () => {
    // Clear auto-save timer to prevent double-save
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current)
    }
    await performSave(true)
  }

  const handleBack = () => {
    if (hasUnsavedChanges) {
      const confirmLeave = window.confirm('You have unsaved changes. Leave anyway?')
      if (!confirmLeave) return
    }
    router.push('/dashboard/projects')
  }

  const handleExport = async (format: 'png' | 'svg' | 'pdf') => {
    if (!storeRef.current) {
      console.error('No Polotno store')
      return
    }

    try {
      let dataUrl = ''

      if (format === 'png') {
        dataUrl = await storeRef.current.toDataURL({ pixelRatio: 2 })
      } else if (format === 'svg') {
        const svgData = await storeRef.current.toSVG()
        const blob = new Blob([svgData], { type: 'image/svg+xml' })
        dataUrl = URL.createObjectURL(blob)
      } else if (format === 'pdf') {
        dataUrl = await storeRef.current.toPDF()
      }

      const link = document.createElement('a')
      link.href = dataUrl
      link.download = `${project?.name || 'overlay'}.${format}`
      link.click()

      if (format === 'svg') {
        URL.revokeObjectURL(dataUrl)
      }

      setShowExportMenu(false)
      console.log('Exported as', format)
    } catch (error) {
      console.error('Export failed:', error)
      alert('Export failed')
    }
  }

  const handleStoreReady = (store: StoreType) => {
    storeRef.current = store
    console.log('Store ready')

    // Set initial last saved time for existing projects
    if (project?.updated_at) {
      setLastSaved(new Date(project.updated_at))
    }
  }

  // Helper to format relative time
  const getRelativeTime = (date: Date | null) => {
    if (!date) return null

    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000)

    if (seconds < 10) return 'just now'
    if (seconds < 60) return `${seconds} seconds ago`

    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`

    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`

    const days = Math.floor(hours / 24)
    return `${days} day${days === 1 ? '' : 's'} ago`
  }

  // Update relative time display every 10 seconds
  const [, setTick] = useState(0)
  useEffect(() => {
    const interval = setInterval(() => {
      setTick(t => t + 1)
    }, 10000)
    return () => clearInterval(interval)
  }, [])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+S or Cmd+S to save
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault()
        handleSave()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleSave])

  if (isLoadingProject) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-background">
        <div className="flex items-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Loading project...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen w-screen flex flex-col bg-background">
      <div className="h-16 border-b border-border-primary bg-card flex items-center px-4 gap-4 z-10">
        <Button variant="outline" onClick={handleBack} className="flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>

        <div className="flex-1" />

        <h1 className="text-xl font-bold">
          {project?.name || 'New Overlay'}
        </h1>

        <div className="flex-1" />

        <div className="flex items-center gap-4">
          {/* Last saved indicator */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving...</span>
              </>
            ) : lastSaved ? (
              <>
                <Check className="w-4 h-4 text-green-500" />
                <span>Saved {getRelativeTime(lastSaved)}</span>
              </>
            ) : hasUnsavedChanges ? (
              <span className="text-yellow-500">Unsaved changes</span>
            ) : null}
          </div>

          <Button onClick={handleSave} disabled={isSaving} variant="outline" className="flex items-center gap-2">
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Save Now
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Now
              </>
            )}
          </Button>

          <div className="relative">
            <Button variant="outline" onClick={() => setShowExportMenu(!showExportMenu)} className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              Export
              <ChevronDown className="w-3 h-3" />
            </Button>

            {showExportMenu && (
              <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-900 rounded-lg shadow-lg border py-2 z-50">
                <button onClick={() => handleExport('png')} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800">
                  Export as PNG
                </button>
                <button onClick={() => handleExport('svg')} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800">
                  Export as SVG
                </button>
                <button onClick={() => handleExport('pdf')} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800">
                  Export as PDF
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1">
        <PolotnoEditor
          onStoreReady={handleStoreReady}
          initialData={project?.project_data}
        />
      </div>
    </div>
  )
}

export default function OverlayBuilderPage() {
  return (
    <Suspense fallback={
      <div className="h-screen w-screen flex items-center justify-center bg-background">
        <div className="flex items-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Loading...</span>
        </div>
      </div>
    }>
      <OverlayBuilderContent />
    </Suspense>
  )
}
