/**
 * useAutoSave Hook
 *
 * Auto-saves project data with debouncing and version snapshots.
 */

'use client'

import { useEffect, useRef } from 'react'
import { useUpdateProject } from './useProjects'
import { useCreateProjectVersion } from './useProjectVersions'
import type { Shape } from '@/lib/types/canvas'
import type { Layer } from '@/lib/types/layers'

interface UseAutoSaveProps {
  projectId: string | undefined
  shapes: Shape[]
  layers: Layer[]
  enabled?: boolean
  debounceMs?: number
  createVersionInterval?: number // Create version every N saves
}

export function useAutoSave({
  projectId,
  shapes,
  layers,
  enabled = true,
  debounceMs = 3000,
  createVersionInterval = 10,
}: UseAutoSaveProps) {
  const updateProject = useUpdateProject()
  const createVersion = useCreateProjectVersion()
  const saveCountRef = useRef(0)
  const timerRef = useRef<NodeJS.Timeout | undefined>(undefined)
  const lastSavedDataRef = useRef<string>('')

  useEffect(() => {
    if (!enabled || !projectId) return

    // Clear existing timer
    if (timerRef.current) {
      clearTimeout(timerRef.current)
    }

    // Check if data has actually changed
    const currentData = JSON.stringify({ shapes, layers })
    if (currentData === lastSavedDataRef.current) {
      return
    }

    // Set new timer
    timerRef.current = setTimeout(async () => {
      const projectData = { shapes, layers }

      try {
        // Update project
        await updateProject.mutateAsync({
          id: projectId,
          updates: {
            project_data: projectData,
            updated_at: new Date().toISOString(),
          },
        })

        // Update last saved data reference
        lastSavedDataRef.current = currentData

        saveCountRef.current += 1

        // Create version snapshot every N saves
        if (saveCountRef.current % createVersionInterval === 0) {
          await createVersion.mutateAsync({
            project_id: projectId,
            project_data: projectData,
            change_description: 'Auto-save checkpoint',
          })
        }
      } catch (error) {
        console.error('Auto-save failed:', error)
      }
    }, debounceMs)

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [shapes, layers, enabled, projectId, debounceMs, createVersionInterval, updateProject, createVersion])

  return {
    isSaving: updateProject.isPending,
    lastSaved: updateProject.data?.updated_at,
    error: updateProject.error,
  }
}
