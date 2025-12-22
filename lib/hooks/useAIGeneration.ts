/**
 * useAIGeneration Hook
 *
 * React Query hooks for AI generation operations.
 */

'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { AIGenerationJob } from '@/lib/types/ai'

/**
 * Fetch all AI generation jobs for the current user
 */
export function useAIJobs() {
  const supabase = createClient()

  return useQuery({
    queryKey: ['ai-jobs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ai_generation_jobs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) throw error
      return data as AIGenerationJob[]
    },
  })
}

/**
 * Fetch a single AI job by ID with polling
 */
export function useAIJob(jobId: string | undefined, enablePolling = true) {
  const supabase = createClient()

  return useQuery({
    queryKey: ['ai-job', jobId],
    queryFn: async () => {
      if (!jobId) throw new Error('Job ID required')

      const { data, error } = await supabase
        .from('ai_generation_jobs')
        .select('*')
        .eq('id', jobId)
        .single()

      if (error) throw error
      return data as AIGenerationJob
    },
    enabled: !!jobId,
    refetchInterval: (data) => {
      // Poll every 5 seconds if still processing
      if (!enablePolling) return false
      return data?.status === 'processing' || data?.status === 'pending' ? 5000 : false
    },
  })
}

/**
 * Generate 3D model from text prompt
 */
export function useGenerateTextTo3D() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async ({
      prompt,
      artStyle = 'realistic',
      negativePrompt,
    }: {
      prompt: string
      artStyle?: 'realistic' | 'cartoon' | 'low-poly' | 'sculpture'
      negativePrompt?: string
    }) => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Call Edge Function to start generation
      const { data, error } = await supabase.functions.invoke('generate-text-to-3d', {
        body: {
          prompt,
          artStyle,
          negativePrompt,
          userId: user.id,
        },
      })

      if (error) throw error
      return data as { jobId: string; externalJobId: string }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-jobs'] })
    },
  })
}

/**
 * Update AI job status (called by webhook or polling)
 */
export function useUpdateAIJob() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async ({
      jobId,
      updates,
    }: {
      jobId: string
      updates: Partial<AIGenerationJob>
    }) => {
      const { data, error } = await supabase
        .from('ai_generation_jobs')
        .update(updates)
        .eq('id', jobId)
        .select()
        .single()

      if (error) throw error
      return data as AIGenerationJob
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['ai-jobs'] })
      queryClient.invalidateQueries({ queryKey: ['ai-job', data.id] })
    },
  })
}

/**
 * Poll external Meshy API for job status
 */
export async function pollMeshyJobStatus(externalJobId: string): Promise<any> {
  const supabase = createClient()

  const { data, error } = await supabase.functions.invoke('check-meshy-status', {
    body: { externalJobId },
  })

  if (error) throw error
  return data
}
