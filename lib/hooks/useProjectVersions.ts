/**
 * useProjectVersions Hook
 *
 * Manage project version history.
 */

'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { ProjectVersion, ProjectVersionInsert } from '@/lib/types/database'

/**
 * Fetch all versions for a project
 */
export function useProjectVersions(projectId: string | undefined) {
  const supabase = createClient()

  return useQuery({
    queryKey: ['project-versions', projectId],
    queryFn: async () => {
      if (!projectId) throw new Error('Project ID is required')

      const { data, error } = await supabase
        .from('project_versions')
        .select('*')
        .eq('project_id', projectId)
        .order('version_number', { ascending: false })

      if (error) throw error
      return data as ProjectVersion[]
    },
    enabled: !!projectId,
  })
}

/**
 * Create a new version snapshot
 */
export function useCreateProjectVersion() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async (version: ProjectVersionInsert) => {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()

      const { data, error } = await (supabase as any)
        .from('project_versions')
        .insert({
          ...version,
          created_by: user?.id,
        })
        .select()
        .single()

      if (error) throw error
      return data as ProjectVersion
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['project-versions', data.project_id] })
    },
  })
}

/**
 * Restore a project to a specific version
 */
export function useRestoreVersion() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async ({ projectId, versionId }: { projectId: string; versionId: string }) => {
      // Fetch the version
      const { data: version, error: versionError } = await supabase
        .from('project_versions')
        .select('*')
        .eq('id', versionId)
        .single()

      if (versionError) throw versionError
      if (!version) throw new Error('Version not found')

      const projectVersion = version as ProjectVersion

      // Update the project with the version's data
      const { data, error } = await (supabase as any)
        .from('projects')
        .update({
          project_data: projectVersion.project_data,
          updated_at: new Date().toISOString(),
        })
        .eq('id', projectId)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['projects', variables.projectId] })
      queryClient.invalidateQueries({ queryKey: ['projects'] })
    },
  })
}
