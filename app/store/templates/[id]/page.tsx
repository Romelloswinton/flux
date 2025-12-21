/**
 * Template Preview Page
 *
 * Read-only preview of a template with "Use Template" button
 */

'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { PREBUILT_WIDGETS, PREBUILT_OVERLAYS } from '@/lib/constants/widgets'
import { useCreateProject } from '@/lib/hooks/useProjects'
import { useAuth } from '@/lib/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ArrowLeft, Plus, Layers, Sparkles, Video, Zap, Eye, Box, Crown, Check } from 'lucide-react'
import type { Asset } from '@/lib/types/layers'
import { TIERS } from '@/lib/constants'

// Dynamically import GLBViewer to prevent SSR issues
const GLBViewer = dynamic(
  () => import('@/components/viewers/GLBViewer').then((mod) => ({ default: mod.GLBViewer })),
  {
    ssr: false,
    loading: () => (
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <Box className="w-12 h-12 mx-auto mb-3 text-purple-400 animate-pulse" />
          <p className="text-sm text-text-secondary">Loading 3D model...</p>
        </div>
      </div>
    ),
  }
)

export default function TemplatePreviewPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const templateId = params.id as string
  const createProject = useCreateProject()

  // Find the template
  const allTemplates = [...PREBUILT_OVERLAYS, ...PREBUILT_WIDGETS]
  const template = allTemplates.find(t => t.id === templateId)

  if (!template) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Template Not Found</h1>
          <p className="text-text-secondary mb-4">The template you're looking for doesn't exist.</p>
          <Button onClick={() => router.push('/dashboard/store')}>
            Back to Store
          </Button>
        </div>
      </div>
    )
  }

  const handleUseTemplate = async () => {
    if (!user) return

    try {
      console.log('Creating project from template:', template)

      const newProject = await createProject.mutateAsync({
        owner_id: user.id,
        name: `${template.name} Project`,
        description: template.data?.description || null,
        canvas_width: 1920,
        canvas_height: 1080,
        canvas_background_color: '#1a1a2e',
        project_data: {
          shapes: template.data?.shapes || [],
          layers: template.data?.layers || [],
        },
        category: template.category,
        tags: template.data?.tags || null,
      } as any)

      console.log('Project created successfully:', newProject)
      router.push(`/dashboard/overlay-builder/${newProject.id}`)
    } catch (error) {
      console.error('❌ Failed to create project:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      alert(`Failed to create project:\n\n${errorMessage}`)
    }
  }

  const getTemplateIcon = (category: string) => {
    switch (category) {
      case 'overlays':
        return <Video className="w-8 h-8" />
      case 'widgets':
        return <Zap className="w-8 h-8" />
      default:
        return <Layers className="w-8 h-8" />
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 border-b border-border sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push('/dashboard/store')}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Store
              </Button>
              <div>
                <h1 className="text-2xl font-bold">{template.name}</h1>
                <p className="text-sm text-text-secondary capitalize">{template.category} Template</p>
              </div>
            </div>
            <Button
              onClick={handleUseTemplate}
              disabled={createProject.isPending}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              size="lg"
            >
              <Plus className="w-5 h-5 mr-2" />
              {createProject.isPending ? 'Creating...' : 'Use This Template'}
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Preview */}
          <div className="lg:col-span-2">
            <Card className="p-0 overflow-hidden border-2">
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 p-8">
                <div className="aspect-video bg-black rounded-lg shadow-2xl border-2 border-purple-200 dark:border-purple-800 flex items-center justify-center relative overflow-hidden">
                  {/* Check if template has 3D model, video, or other content */}
                  {(() => {
                    // Check for 3D model first
                    const modelShape = template.data?.shapes?.find((s: any) => s.type === '3d-model' && s.modelUrl)

                    if (modelShape) {
                      return (
                        <>
                          {/* 3D Model Preview */}
                          <div className="absolute inset-0">
                            <GLBViewer
                              modelUrl={modelShape.modelUrl}
                              autoRotate={modelShape.autoRotate ?? true}
                            />
                          </div>
                          {/* Gradient overlay for depth */}
                          <div className="absolute inset-0 bg-gradient-to-t from-purple-900/30 via-transparent to-black/20 pointer-events-none" />
                        </>
                      )
                    }

                    // Check for video
                    const videoShape = template.data?.shapes?.find((s: any) => s.type === 'video' && s.videoUrl)

                    if (videoShape) {
                      return (
                        <>
                          {/* Video Preview */}
                          <video
                            src={videoShape.videoUrl}
                            autoPlay
                            loop
                            muted
                            playsInline
                            className="absolute inset-0 w-full h-full object-cover"
                          />
                          {/* Overlay gradient for readability */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20 pointer-events-none" />
                        </>
                      )
                    }

                    // Alert Box template preview
                    if (template.id === 'widget-alert-box') {
                      return (
                        <div className="absolute inset-0 flex items-center justify-center p-8">
                          {/* Alert Box Mockup */}
                          <div className="w-full max-w-2xl">
                            <div className="bg-gradient-to-br from-purple-600 to-purple-800 rounded-2xl p-8 shadow-2xl border-4 border-white/30 relative">
                              {/* Top accent line */}
                              <div className="absolute top-6 left-1/2 -translate-x-1/2 w-48 h-1 bg-white/40 rounded-full"></div>

                              {/* Icon circle */}
                              <div className="flex items-center justify-center mb-6">
                                <div className="w-16 h-16 bg-white rounded-full border-4 border-purple-400 shadow-lg flex items-center justify-center">
                                  <Sparkles className="w-8 h-8 text-purple-600" />
                                </div>
                              </div>

                              {/* Title */}
                              <h3 className="text-4xl font-bold text-white text-center mb-3">
                                NEW FOLLOWER!
                              </h3>

                              {/* Username */}
                              <p className="text-2xl text-white/90 text-center mb-2">
                                Username
                              </p>

                              {/* Subtitle */}
                              <p className="text-lg text-white/70 text-center italic">
                                Thank you for the support!
                              </p>

                              {/* Bottom accent line */}
                              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-48 h-1 bg-white/40 rounded-full"></div>
                            </div>
                          </div>
                        </div>
                      )
                    }

                    // Fallback to icon for other templates
                    return (
                      <>
                        {/* Background pattern */}
                        <div className="absolute inset-0 opacity-5">
                          <div className="absolute inset-0" style={{
                            backgroundImage: 'radial-gradient(circle, #a855f7 1px, transparent 1px)',
                            backgroundSize: '20px 20px'
                          }}></div>
                        </div>

                        {/* Preview Icon */}
                        <div className="relative">
                          <div className="w-32 h-32 bg-gradient-to-br from-purple-400 to-pink-400 rounded-3xl flex items-center justify-center shadow-2xl">
                            {getTemplateIcon(template.category)}
                            <div className="absolute -top-3 -right-3 w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
                              <Eye className="w-6 h-6 text-white" />
                            </div>
                          </div>
                        </div>
                      </>
                    )
                  })()}

                  {/* Preview Label */}
                  <div className="absolute top-4 left-4 z-10">
                    <div className="px-4 py-2 bg-white/90 dark:bg-gray-900/90 rounded-full shadow-lg border border-purple-200 dark:border-purple-800 backdrop-blur-sm">
                      <p className="text-sm font-semibold text-purple-600 dark:text-purple-400 flex items-center gap-2">
                        {template.data?.shapes?.find((s: any) => s.type === '3d-model') ? (
                          <>
                            <Box className="w-4 h-4" />
                            3D Model Preview
                          </>
                        ) : template.data?.shapes?.find((s: any) => s.type === 'video') ? (
                          'Live Preview'
                        ) : (
                          'Template Preview'
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Interactive Controls Hint for 3D */}
                  {template.data?.shapes?.find((s: any) => s.type === '3d-model') && (
                    <div className="absolute bottom-4 right-4 z-10">
                      <div className="px-4 py-2 bg-black/70 rounded-lg shadow-lg backdrop-blur-sm">
                        <p className="text-xs text-white/90">
                          🖱️ Click and drag to rotate • Scroll to zoom
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <p className="text-center text-sm text-text-secondary mt-4">
                  {template.data?.shapes?.find((s: any) => s.type === '3d-model')
                    ? 'Interactive 3D model preview - drag to rotate and explore! Click "Use This Template" to customize and make it your own'
                    : template.data?.shapes?.find((s: any) => s.type === 'video')
                    ? 'Video preview shown above - click "Use This Template" to customize and make it your own'
                    : 'Click "Use This Template" to customize and make it your own'}
                </p>
              </div>
            </Card>
          </div>

          {/* Sidebar Info */}
          <div className="space-y-6">
            {/* Description */}
            {template.data?.description && (
              <Card className="p-6">
                <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                  About This Template
                </h3>
                <p className="text-sm text-text-secondary leading-relaxed">
                  {template.data.description}
                </p>
              </Card>
            )}

            {/* Pricing */}
            <Card className="p-6 border-2 border-purple-200 dark:border-purple-800">
              <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                <Crown className="w-5 h-5 text-purple-600" />
                Template Pricing
              </h3>

              {/* Determine if template is premium (3D models are premium) */}
              {(() => {
                const isPremium = template.data?.tags?.includes('3d-model') ||
                                  template.data?.tags?.includes('3d');

                if (isPremium) {
                  return (
                    <div className="space-y-4">
                      <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-text-secondary">Pro Template</span>
                          <span className="text-2xl font-bold text-purple-600">{TIERS.PRO.price}</span>
                        </div>
                        <p className="text-xs text-text-secondary">
                          This premium 3D template is included with Pro subscription
                        </p>
                      </div>

                      <div className="space-y-2">
                        <p className="text-sm font-semibold text-purple-600 flex items-center gap-2">
                          <Crown className="w-4 h-4" />
                          Pro Features:
                        </p>
                        <ul className="space-y-1.5">
                          {TIERS.PRO.features.slice(0, 4).map((feature, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-sm text-text-secondary">
                              <Check className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <Button
                        variant="outline"
                        className="w-full border-purple-600 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950/30"
                        onClick={() => window.location.href = '/pricing'}
                      >
                        <Crown className="w-4 h-4 mr-2" />
                        Upgrade to Pro
                      </Button>
                    </div>
                  );
                } else {
                  return (
                    <div className="space-y-4">
                      <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 rounded-lg p-4 border border-green-200 dark:border-green-800">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-text-secondary">Free Template</span>
                          <span className="text-2xl font-bold text-green-600">$0</span>
                        </div>
                        <p className="text-xs text-text-secondary">
                          This template is available on the free plan
                        </p>
                      </div>

                      <div className="space-y-2">
                        <p className="text-sm font-semibold text-green-600 flex items-center gap-2">
                          <Check className="w-4 h-4" />
                          Included for Free:
                        </p>
                        <ul className="space-y-1.5">
                          {TIERS.FREE.features.slice(0, 3).map((feature, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-sm text-text-secondary">
                              <Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="pt-2 border-t border-border">
                        <p className="text-xs text-text-secondary text-center">
                          Want more features?
                          <button
                            className="text-purple-600 hover:underline ml-1 font-medium"
                            onClick={() => window.location.href = '/pricing'}
                          >
                            Upgrade to Pro
                          </button>
                        </p>
                      </div>
                    </div>
                  );
                }
              })()}
            </Card>

            {/* Usage Tips */}
            {template.data?.usage && (
              <Card className="p-6">
                <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                  Usage Tips
                </h3>
                <p className="text-sm text-text-secondary leading-relaxed">
                  {template.data.usage}
                </p>
              </Card>
            )}

            {/* Tags */}
            {template.data?.tags && template.data.tags.length > 0 && (
              <Card className="p-6">
                <h3 className="font-bold text-lg mb-3">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {template.data.tags.map((tag: string) => (
                    <span
                      key={tag}
                      className="px-3 py-1.5 text-sm font-medium rounded-lg bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </Card>
            )}

            {/* CTA */}
            <Button
              onClick={handleUseTemplate}
              disabled={createProject.isPending}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 py-6 text-lg shadow-lg"
              size="lg"
            >
              <Plus className="w-5 h-5 mr-2" />
              {createProject.isPending ? 'Creating Project...' : 'Use This Template'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
