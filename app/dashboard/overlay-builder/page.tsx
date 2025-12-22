"use client"

import dynamic from 'next/dynamic'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Save, Loader2, Download, ChevronDown, Check, History, X } from 'lucide-react'
import { useProject, useCreateProject, useUpdateProject } from '@/lib/hooks/useProjects'
import { useAuth } from '@/lib/hooks/useAuth'
import { useProjectVersions, useCreateProjectVersion, useRestoreVersion } from '@/lib/hooks/useProjectVersions'
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
  const exportMenuRef = useRef<HTMLDivElement>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [showExportMenu, setShowExportMenu] = useState(false)
  const [showVersionHistory, setShowVersionHistory] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null)
  const lastSavedDataRef = useRef<string>('')
  const saveCountRef = useRef(0)

  const { user } = useAuth()
  const { data: project, isLoading: isLoadingProject } = useProject(projectId || undefined)
  const { data: versions, isLoading: isLoadingVersions } = useProjectVersions(projectId || undefined)
  const createProject = useCreateProject()
  const updateProject = useUpdateProject()
  const createVersion = useCreateProjectVersion()
  const restoreVersion = useRestoreVersion()

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

      // Create version snapshot every 10 saves
      if (projectId) {
        saveCountRef.current += 1
        if (saveCountRef.current % 10 === 0) {
          try {
            await createVersion.mutateAsync({
              project_id: projectId,
              project_data: snapshot as any,
              change_description: `Auto-save checkpoint #${saveCountRef.current}`,
            })
            console.log('Version snapshot created')
          } catch (versionError) {
            console.error('Failed to create version:', versionError)
            // Don't fail the save if version creation fails
          }
        }
      }
    } catch (error) {
      console.error('Save failed:', error)
      if (isManualSave) {
        alert('Failed to save project.')
      }
    } finally {
      setIsSaving(false)
    }
  }, [projectId, project, user, updateProject, createProject, createVersion, router])

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

  const handleRestoreVersion = async (versionId: string) => {
    if (!projectId) return

    const confirmRestore = window.confirm(
      'Are you sure you want to restore this version? Current unsaved changes will be lost.'
    )

    if (!confirmRestore) return

    try {
      await restoreVersion.mutateAsync({ projectId, versionId })

      // Reload the page to refresh the editor with restored data
      window.location.reload()
    } catch (error) {
      console.error('Failed to restore version:', error)
      alert('Failed to restore version')
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

  // Close export menu when clicking outside
  useEffect(() => {
    if (!showExportMenu) return

    const handleClickOutside = (event: MouseEvent) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
        setShowExportMenu(false)
      }
    }

    // Add small delay to prevent immediate closing
    setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside)
    }, 0)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showExportMenu])

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

  // Custom toolbar components
  const toolbarLeft = (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleBack}
        className="flex items-center gap-2"
        style={{
          background: 'rgba(0, 0, 0, 0.05)',
          borderRadius: '4px',
          padding: '6px 12px',
          fontSize: '14px'
        }}
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </Button>
      <div style={{
        fontSize: '16px',
        fontWeight: 600,
        marginLeft: '12px'
      }}>
        {project?.name || 'New Overlay'}
      </div>
    </>
  )

  const toolbarRight = (
    <>
      {/* Last saved indicator */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        fontSize: '13px',
        color: '#666'
      }}>
        {isSaving ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Saving...</span>
          </>
        ) : lastSaved ? (
          <>
            <Check className="w-4 h-4" style={{ color: '#22c55e' }} />
            <span>Saved {getRelativeTime(lastSaved)}</span>
          </>
        ) : hasUnsavedChanges ? (
          <span style={{ color: '#eab308' }}>Unsaved changes</span>
        ) : null}
      </div>

      <Button
        onClick={handleSave}
        disabled={isSaving}
        variant="ghost"
        size="sm"
        className="flex items-center gap-2"
        style={{
          background: 'rgba(0, 0, 0, 0.05)',
          borderRadius: '4px',
          padding: '6px 12px',
          fontSize: '14px'
        }}
      >
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

      <div style={{ position: 'relative' }} ref={exportMenuRef}>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowExportMenu(!showExportMenu)}
          className="flex items-center gap-2"
          style={{
            background: 'rgba(0, 0, 0, 0.05)',
            borderRadius: '4px',
            padding: '6px 12px',
            fontSize: '14px'
          }}
        >
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

      <Button
        variant="ghost"
        size="sm"
        onClick={() => setShowVersionHistory(!showVersionHistory)}
        className="flex items-center gap-2"
        disabled={!projectId}
        style={{
          background: 'rgba(0, 0, 0, 0.05)',
          borderRadius: '4px',
          padding: '6px 12px',
          fontSize: '14px'
        }}
      >
        <History className="w-4 h-4" />
        History
      </Button>
    </>
  )

  return (
    <div className="h-screen w-screen flex flex-col bg-background">
      <div className="flex-1 relative">
        <PolotnoEditor
          onStoreReady={handleStoreReady}
          initialData={project?.project_data}
          customToolbarLeft={toolbarLeft}
          customToolbarRight={toolbarRight}
        />

        {/* Version History Panel */}
        {showVersionHistory && (
          <div className="absolute top-0 right-0 h-full w-80 bg-white dark:bg-gray-900 border-l border-border-primary shadow-lg z-50 flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border-primary">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <History className="w-5 h-5" />
                Version History
              </h2>
              <Button variant="ghost" size="sm" onClick={() => setShowVersionHistory(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Version List */}
            <div className="flex-1 overflow-y-auto p-4">
              {isLoadingVersions ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin" />
                </div>
              ) : !versions || versions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <History className="w-12 h-12 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No version history yet</p>
                  <p className="text-xs mt-1">Versions are created every 10 saves</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {versions.map((version, index) => (
                    <div
                      key={version.id}
                      className="p-3 rounded-lg border border-border-primary hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">
                              v{version.version_number}
                            </span>
                            {index === 0 && (
                              <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded">
                                Latest
                              </span>
                            )}
                          </div>
                          <p className="text-sm mt-1 text-muted-foreground truncate">
                            {version.change_description || 'No description'}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {getRelativeTime(new Date(version.created_at))}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRestoreVersion(version.id)}
                          disabled={restoreVersion.isPending}
                          className="text-xs"
                        >
                          Restore
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
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
