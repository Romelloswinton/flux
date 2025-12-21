/**
 * Widgets Library Page
 *
 * Browse and preview pre-built widget templates
 */

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { PREBUILT_WIDGETS, PREBUILT_OVERLAYS } from '@/lib/constants/widgets'
import { useProjects, useCreateProject } from '@/lib/hooks/useProjects'
import { useAuth } from '@/lib/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Search, Grid3x3, List, Plus, Eye, Sparkles, ArrowRight } from 'lucide-react'
import type { Asset } from '@/lib/types/layers'

export default function WidgetsPage() {
  const router = useRouter()
  const { user } = useAuth()
  const createProject = useCreateProject()
  const { data: projects } = useProjects()

  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedWidget, setSelectedWidget] = useState<Asset | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'overlays' | 'widgets'>('all')

  // Combine all templates
  const allTemplates = [...PREBUILT_OVERLAYS, ...PREBUILT_WIDGETS]

  // Filter templates based on search and category
  const filteredWidgets = allTemplates.filter(widget => {
    const matchesSearch = widget.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      widget.data?.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      widget.data?.tags?.some((tag: string) => tag.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesCategory = selectedCategory === 'all' || widget.category === selectedCategory

    return matchesSearch && matchesCategory
  })

  const handleUseWidget = async (widget: Asset) => {
    if (!user) return

    try {
      console.log('Creating project with widget:', widget)

      // Create a new project with this widget
      const newProject = await createProject.mutateAsync({
        owner_id: user.id,
        name: `${widget.name} Project`,
        description: widget.data?.description || null,
        canvas_width: 1920,
        canvas_height: 1080,
        canvas_background_color: '#1a1a2e',
        project_data: {
          shapes: widget.data?.shapes || [],
          layers: widget.data?.layers || [],
        },
        category: widget.category,
        tags: widget.data?.tags || null,
      } as any)

      console.log('Project created successfully:', newProject)

      // Navigate to the overlay builder with the new project
      router.push(`/dashboard/overlay-builder/${newProject.id}`)
    } catch (error) {
      console.error('Failed to create project with widget:', error)
      alert(`Failed to create project: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const handlePreview = (widget: Asset) => {
    setSelectedWidget(widget)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header with gradient */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-12 px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-3">
            <Sparkles className="w-8 h-8" />
            <h1 className="text-4xl font-bold">Template Library</h1>
          </div>
          <p className="text-lg text-purple-100">
            Pre-built, customizable overlays and widgets for your Twitch stream
          </p>
          <p className="text-sm text-purple-200 mt-2">
            {filteredWidgets.length} {filteredWidgets.length === 1 ? 'template' : 'templates'} available
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-8">
        {/* Category Filter */}
        <div className="flex gap-3 mb-6">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-6 py-2 rounded-full font-medium transition-all ${
              selectedCategory === 'all'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            All Templates
          </button>
          <button
            onClick={() => setSelectedCategory('overlays')}
            className={`px-6 py-2 rounded-full font-medium transition-all ${
              selectedCategory === 'overlays'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            Overlays
          </button>
          <button
            onClick={() => setSelectedCategory('widgets')}
            className={`px-6 py-2 rounded-full font-medium transition-all ${
              selectedCategory === 'widgets'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            Widgets
          </button>
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-4 mb-6">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-secondary" />
            <input
              type="text"
              placeholder="Search templates by name, description, or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-border rounded-md bg-background focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          {/* View Toggle */}
          <div className="flex gap-2 border border-border rounded-md p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded ${viewMode === 'grid' ? 'bg-primary text-white' : 'text-text-secondary hover:bg-surface'}`}
            >
              <Grid3x3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded ${viewMode === 'list' ? 'bg-primary text-white' : 'text-text-secondary hover:bg-surface'}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Widgets Grid/List */}
        {filteredWidgets.length > 0 ? (
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'flex flex-col gap-4'}>
            {filteredWidgets.map((widget) => (
              <Card
                key={widget.id}
                className={`group relative overflow-hidden ${viewMode === 'list' ? 'flex items-center p-6' : 'p-6'}`}
              >
                {/* Widget Preview */}
                <div className={`bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 rounded-lg flex items-center justify-center mb-4 relative overflow-hidden ${viewMode === 'grid' ? 'aspect-video' : 'w-48 h-32 flex-shrink-0'}`}>
                  {/* Decorative elements */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-3/4 h-3/4 border-2 border-dashed border-purple-300 dark:border-purple-700 rounded-lg flex items-center justify-center">
                      <Sparkles className="w-12 h-12 text-purple-400" />
                    </div>
                  </div>

                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handlePreview(widget)}
                      className="bg-white text-black hover:bg-gray-100"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Preview
                    </Button>
                  </div>
                </div>

                {/* Widget Info */}
                <div className={viewMode === 'list' ? 'flex-1 ml-6' : ''}>
                  <h3 className="font-semibold text-xl mb-2">{widget.name}</h3>

                  {widget.data?.description && (
                    <p className="text-sm text-text-secondary mb-3 line-clamp-2">
                      {widget.data.description}
                    </p>
                  )}

                  {/* Tags */}
                  {widget.data?.tags && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {widget.data.tags.slice(0, 3).map((tag: string) => (
                        <span
                          key={tag}
                          className="px-2 py-1 text-xs rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Stats */}
                  <div className="flex items-center gap-4 text-xs text-text-secondary mb-4">
                    <span>{widget.data?.shapes?.length || 0} components</span>
                    <span>•</span>
                    <span className="capitalize">{widget.type}</span>
                  </div>

                  {/* Action Button */}
                  <Button
                    onClick={() => handleUseWidget(widget)}
                    disabled={createProject.isPending}
                    className="w-full group/btn"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    {createProject.isPending ? 'Creating...' : 'Use This Widget'}
                    <ArrowRight className="w-4 h-4 ml-2 opacity-0 group-hover/btn:opacity-100 transition-opacity" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <Search className="w-16 h-16 text-text-secondary mx-auto mb-4 opacity-30" />
            <h3 className="text-xl font-semibold mb-2">No widgets found</h3>
            <p className="text-text-secondary mb-6">
              {searchQuery
                ? `No widgets match "${searchQuery}". Try a different search.`
                : 'No widgets available at this time.'}
            </p>
            {searchQuery && (
              <Button onClick={() => setSearchQuery('')} variant="outline">
                Clear Search
              </Button>
            )}
          </div>
        )}

        {/* Usage Guide */}
        <div className="mt-12 p-6 bg-purple-50 dark:bg-purple-950/20 rounded-lg border border-purple-200 dark:border-purple-800">
          <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            How to Use Widgets
          </h3>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div>
              <div className="font-medium mb-1">1. Browse & Select</div>
              <p className="text-text-secondary">
                Find the perfect widget for your stream from our library
              </p>
            </div>
            <div>
              <div className="font-medium mb-1">2. Customize</div>
              <p className="text-text-secondary">
                Edit colors, text, and layout to match your branding
              </p>
            </div>
            <div>
              <div className="font-medium mb-1">3. Export & Use</div>
              <p className="text-text-secondary">
                Export and integrate with your streaming software
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {selectedWidget && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-8"
          onClick={() => setSelectedWidget(null)}
        >
          <Card
            className="max-w-4xl w-full max-h-[90vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-8">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold mb-2">{selectedWidget.name}</h2>
                  {selectedWidget.data?.description && (
                    <p className="text-text-secondary">{selectedWidget.data.description}</p>
                  )}
                </div>
                <button
                  onClick={() => setSelectedWidget(null)}
                  className="text-text-secondary hover:text-foreground text-2xl"
                >
                  ×
                </button>
              </div>

              {/* Preview Area */}
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 rounded-lg p-8 mb-6 min-h-[300px]">
                <div className="text-center mb-6">
                  <p className="text-sm font-semibold text-purple-600 dark:text-purple-400 mb-2">Widget Components Preview</p>
                  <p className="text-xs text-text-secondary">
                    {selectedWidget.data?.shapes?.length || 0} components • {selectedWidget.data?.layers?.length || 0} layers
                  </p>
                </div>

                {/* Component List Visual */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-[250px] overflow-y-auto">
                  {selectedWidget.data?.shapes?.map((shape: any, index: number) => (
                    <div
                      key={shape.id || index}
                      className="bg-white dark:bg-gray-900 rounded-lg p-3 border border-purple-200 dark:border-purple-800 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div className={`w-8 h-8 rounded-md flex items-center justify-center text-xs font-bold text-white ${
                          shape.type === 'video' ? 'bg-gradient-to-br from-blue-500 to-blue-600' :
                          shape.type === 'text' ? 'bg-gradient-to-br from-green-500 to-green-600' :
                          shape.type === 'rect' ? 'bg-gradient-to-br from-purple-500 to-purple-600' :
                          shape.type === 'circle' ? 'bg-gradient-to-br from-pink-500 to-pink-600' :
                          'bg-gradient-to-br from-gray-500 to-gray-600'
                        }`}>
                          {shape.type === 'text' && 'T'}
                          {shape.type === 'rect' && '□'}
                          {shape.type === 'circle' && '○'}
                          {!['text', 'rect', 'circle'].includes(shape.type) && '◇'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium truncate capitalize">{shape.type}</p>
                        </div>
                      </div>
                      <div className="text-xs text-text-secondary space-y-0.5">
                        {shape.width && <p>W: {shape.width}px</p>}
                        {shape.height && <p>H: {shape.height}px</p>}
                        {shape.text && <p className="truncate">"{shape.text}"</p>}
                        {shape.fill && <p className="truncate">Fill: {typeof shape.fill === 'string' ? shape.fill.substring(0, 20) : 'gradient'}</p>}
                      </div>
                    </div>
                  ))}
                </div>

                {(!selectedWidget.data?.shapes || selectedWidget.data.shapes.length === 0) && (
                  <div className="text-center py-12">
                    <Sparkles className="w-16 h-16 mx-auto mb-4 text-purple-400 opacity-30" />
                    <p className="text-text-secondary">No preview available</p>
                  </div>
                )}
              </div>

              {/* Widget Details */}
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">What's Included</h3>
                  <ul className="list-disc list-inside text-sm text-text-secondary space-y-1">
                    {selectedWidget.data?.layers?.map((layer: any) => (
                      <li key={layer.id}>{layer.name}</li>
                    ))}
                  </ul>
                </div>

                {selectedWidget.data?.usage && (
                  <div>
                    <h3 className="font-semibold mb-2">Usage Tips</h3>
                    <p className="text-sm text-text-secondary">{selectedWidget.data.usage}</p>
                  </div>
                )}

                {selectedWidget.data?.tags && (
                  <div>
                    <h3 className="font-semibold mb-2">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedWidget.data.tags.map((tag: string) => (
                        <span
                          key={tag}
                          className="px-3 py-1 text-sm rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 mt-6">
                <Button
                  onClick={() => handleUseWidget(selectedWidget)}
                  disabled={createProject.isPending}
                  className="flex-1"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {createProject.isPending ? 'Creating...' : 'Use This Widget'}
                </Button>
                <Button
                  onClick={() => setSelectedWidget(null)}
                  variant="outline"
                >
                  Close
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
