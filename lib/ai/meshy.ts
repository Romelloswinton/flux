/**
 * Meshy AI Client
 *
 * Official API Documentation: https://docs.meshy.ai
 */

import type { MeshyTextTo3DRequest, MeshyTextTo3DResponse, MeshyTaskStatus } from '@/lib/types/ai'

export class MeshyClient {
  private apiKey: string
  private baseUrl = 'https://api.meshy.ai/openapi/v2'

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  /**
   * Create a text-to-3D generation task
   * https://docs.meshy.ai/api-text-to-3d
   */
  async createTextTo3D(params: MeshyTextTo3DRequest): Promise<string> {
    const response = await fetch(`${this.baseUrl}/text-to-3d`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        mode: 'preview', // 'preview' is faster, 'refine' is higher quality
        prompt: params.prompt,
        art_style: params.art_style || 'realistic',
        negative_prompt: params.negative_prompt || '',
        seed: params.seed,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(`Meshy API error: ${error.message || response.statusText}`)
    }

    const data: MeshyTextTo3DResponse = await response.json()
    return data.result // Returns task ID
  }

  /**
   * Get task status
   * https://docs.meshy.ai/api-check-task-status
   */
  async getTaskStatus(taskId: string): Promise<MeshyTaskStatus> {
    const response = await fetch(`${this.baseUrl}/text-to-3d/${taskId}`, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
      },
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(`Meshy API error: ${error.message || response.statusText}`)
    }

    const data: MeshyTaskStatus = await response.json()
    return data
  }

  /**
   * Poll task until completion (with timeout)
   */
  async pollTaskUntilComplete(
    taskId: string,
    maxAttempts: number = 60, // 60 attempts = 5 minutes max
    intervalMs: number = 5000  // Poll every 5 seconds
  ): Promise<MeshyTaskStatus> {
    let attempts = 0

    while (attempts < maxAttempts) {
      const status = await this.getTaskStatus(taskId)

      if (status.status === 'SUCCEEDED' || status.status === 'FAILED' || status.status === 'EXPIRED') {
        return status
      }

      // Wait before next poll
      await new Promise(resolve => setTimeout(resolve, intervalMs))
      attempts++
    }

    throw new Error('Task polling timeout - maximum attempts reached')
  }

  /**
   * Refine a preview model to higher quality
   * https://docs.meshy.ai/api-refine-preview
   */
  async refinePreview(taskId: string): Promise<string> {
    const response = await fetch(`${this.baseUrl}/text-to-3d`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        mode: 'refine',
        preview_task_id: taskId,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(`Meshy API error: ${error.message || response.statusText}`)
    }

    const data: MeshyTextTo3DResponse = await response.json()
    return data.result // Returns new refined task ID
  }
}

// Helper to format Meshy status for display
export function formatMeshyStatus(status: MeshyTaskStatus): {
  label: string
  progress: number
  isComplete: boolean
  isError: boolean
} {
  const statusMap = {
    'PENDING': { label: 'Queued', progress: 0, isComplete: false, isError: false },
    'IN_PROGRESS': { label: 'Generating', progress: status.progress || 50, isComplete: false, isError: false },
    'SUCCEEDED': { label: 'Complete', progress: 100, isComplete: true, isError: false },
    'FAILED': { label: 'Failed', progress: 0, isComplete: true, isError: true },
    'EXPIRED': { label: 'Expired', progress: 0, isComplete: true, isError: true },
  }

  return statusMap[status.status] || statusMap['PENDING']
}
