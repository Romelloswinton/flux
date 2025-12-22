'use client'

import { Canvas3D, Canvas3DLoader } from '@/components/3d/Canvas3D'
import { ModelViewer } from '@/components/3d/ModelViewer'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { ArrowLeft, Sparkles, Upload, Loader2, Box, Save, CheckCircle, XCircle } from 'lucide-react'
import { useState, Suspense, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useGenerateTextTo3D, useAIJob, pollMeshyJobStatus } from '@/lib/hooks/useAIGeneration'
import { useCreate3DModel } from '@/lib/hooks/use3DModels'
import { useAuth } from '@/lib/hooks/useAuth'

function AIGeneratorContent() {
  const router = useRouter()
  const { user } = useAuth()
  const [prompt, setPrompt] = useState('')
  const [artStyle, setArtStyle] = useState<'realistic' | 'cartoon' | 'low-poly' | 'sculpture'>('realistic')
  const [jobId, setJobId] = useState<string | undefined>()
  const [externalJobId, setExternalJobId] = useState<string | undefined>()
  const [generatedModelUrl, setGeneratedModelUrl] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const generateMutation = useGenerateTextTo3D()
  const { data: job, isLoading: isLoadingJob } = useAIJob(jobId, true)
  const createModel = useCreate3DModel()

  // Poll Meshy status when we have an external job ID
  useEffect(() => {
    if (!externalJobId || !jobId) return
    if (job?.status === 'succeeded' || job?.status === 'failed') return

    const pollInterval = setInterval(async () => {
      try {
        await pollMeshyJobStatus(externalJobId)
      } catch (error) {
        console.error('Polling error:', error)
      }
    }, 5000)

    return () => clearInterval(pollInterval)
  }, [externalJobId, jobId, job?.status])

  // Update model URL when job succeeds
  useEffect(() => {
    if (job?.status === 'succeeded' && job.result_url) {
      setGeneratedModelUrl(job.result_url)
    }
  }, [job?.status, job?.result_url])

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      alert('Please enter a description for your 3D model')
      return
    }

    try {
      const result = await generateMutation.mutateAsync({
        prompt,
        artStyle,
      })

      setJobId(result.jobId)
      setExternalJobId(result.externalJobId)
    } catch (error) {
      console.error('Generation failed:', error)
      alert('Failed to start generation. Please check your API key and try again.')
    }
  }

  const handleSaveToLibrary = async () => {
    if (!generatedModelUrl || !user || !job) return

    setIsSaving(true)
    try {
      await createModel.mutateAsync({
        owner_id: user.id,
        name: prompt.slice(0, 100),
        model_url: generatedModelUrl,
        thumbnail_url: job.thumbnail_url,
        format: 'glb',
        has_textures: true,
        has_animations: false,
        generation_method: 'text-to-3d',
        generation_prompt: prompt,
      })

      alert('Model saved to library!')
      router.push('/dashboard/3d-builder')
    } catch (error) {
      console.error('Save failed:', error)
      alert('Failed to save model. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const isGenerating = job?.status === 'processing' || job?.status === 'pending' || generateMutation.isPending
  const hasSucceeded = job?.status === 'succeeded'
  const hasFailed = job?.status === 'failed'
  const progress = job?.external_status === 'IN_PROGRESS' ? 50 : job?.status === 'pending' ? 10 : 0

  return (
    <div className="h-screen w-screen flex">
      {/* Left Panel: AI Generation Controls */}
      <div className="w-96 border-r border-border-primary bg-card overflow-y-auto">
        <div className="p-4 border-b border-border-primary">
          <h2 className="font-semibold flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            AI 3D Generator
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Generate 3D models from text descriptions
          </p>
        </div>

        <div className="p-4 space-y-4">
          {/* Prompt Input */}
          <div>
            <label className="text-sm font-medium mb-2 block">
              Describe your 3D model
            </label>
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="A futuristic robot character with glowing blue eyes and metallic armor..."
              rows={6}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Be specific for better results
            </p>
          </div>

          {/* Art Style Selection */}
          <div>
            <label className="text-sm font-medium mb-2 block">
              Art Style
            </label>
            <div className="grid grid-cols-2 gap-2">
              {['realistic', 'cartoon', 'low-poly', 'sculpture'].map((style) => (
                <button
                  key={style}
                  onClick={() => setArtStyle(style)}
                  className={`px-3 py-2 rounded-lg border text-sm capitalize transition-colors ${
                    artStyle === style
                      ? 'border-primary bg-primary/10'
                      : 'border-border-primary hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  {style}
                </button>
              ))}
            </div>
          </div>

          {/* Generate Button */}
          <Button
            onClick={handleGenerate}
            disabled={isGenerating || !prompt.trim()}
            className="w-full"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate 3D Model
              </>
            )}
          </Button>

          {/* Status Box */}
          {hasSucceeded && (
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-green-700 dark:text-green-300">
                    Model generated successfully!
                  </p>
                  <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                    Preview your model on the right. Click "Save to Library" to keep it.
                  </p>
                </div>
              </div>
              <Button
                onClick={handleSaveToLibrary}
                disabled={isSaving}
                className="w-full mt-3"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save to Library
                  </>
                )}
              </Button>
            </div>
          )}

          {hasFailed && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <div className="flex items-start gap-2">
                <XCircle className="w-5 h-5 text-red-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-red-700 dark:text-red-300">
                    Generation failed
                  </p>
                  <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                    {job?.error_message || 'Please try again with a different prompt.'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {isGenerating && (
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="flex items-start gap-2">
                <Loader2 className="w-5 h-5 text-blue-600 animate-spin mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
                    Generating your 3D model...
                  </p>
                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                    This usually takes 2-3 minutes
                  </p>
                  <div className="mt-2 bg-blue-200 dark:bg-blue-800 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-blue-600 dark:bg-blue-400 h-full transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="pt-4 border-t border-border-primary space-y-2">
            <Button
              variant="outline"
              onClick={() => router.push('/dashboard/3d-builder')}
              className="w-full justify-start"
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload Existing Model
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push('/dashboard/projects')}
              className="w-full justify-start"
            >
              <Box className="w-4 h-4 mr-2" />
              View My Models
            </Button>
          </div>
        </div>
      </div>

      {/* Right Panel: 3D Preview */}
      <div className="flex-1 flex flex-col">
        <div className="h-16 border-b border-border-primary bg-card flex items-center justify-between px-4">
          <Button
            variant="outline"
            onClick={() => router.push('/dashboard/projects')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>

          <h2 className="font-medium">Preview</h2>

          <div className="w-24" /> {/* Spacer for centering */}
        </div>

        <div className="flex-1 relative">
          <Suspense fallback={<Canvas3DLoader />}>
            <Canvas3D>
              {generatedModelUrl && (
                <ModelViewer
                  modelUrl={generatedModelUrl}
                  onLoad={() => console.log('Model loaded')}
                />
              )}
              {!generatedModelUrl && (
                <mesh>
                  <boxGeometry args={[1, 1, 1]} />
                  <meshStandardMaterial color="#888888" />
                </mesh>
              )}
            </Canvas3D>
          </Suspense>

          {!generatedModelUrl && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center text-muted-foreground">
                <Sparkles className="w-16 h-16 mx-auto mb-4 opacity-30" />
                <p className="text-lg font-medium">No model generated yet</p>
                <p className="text-sm mt-1">Enter a description and click Generate</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function AIGeneratorPage() {
  return (
    <Suspense fallback={<Canvas3DLoader />}>
      <AIGeneratorContent />
    </Suspense>
  )
}
