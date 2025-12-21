/**
 * Store Page
 *
 * Browse and purchase pre-built overlay and widget templates
 */

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { PREBUILT_WIDGETS, PREBUILT_OVERLAYS } from '@/lib/constants/widgets'
import type { Asset } from '@/lib/types/layers'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Search, Grid3x3, List, Eye, Sparkles, ArrowRight, Layers, Zap, Video, ShoppingBag, Box } from 'lucide-react'

// Dynamically import GLBViewer to prevent SSR issues
const GLBViewer = dynamic(
  () => import('@/components/viewers/GLBViewer').then((mod) => ({ default: mod.GLBViewer })),
  {
    ssr: false,
    loading: () => (
      <div className="absolute inset-0 flex items-center justify-center">
        <Box className="w-12 h-12 text-purple-400 animate-pulse" />
      </div>
    ),
  }
)

export default function StorePage() {
  const router = useRouter()

  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'overlays' | 'widgets'>('all')

  // Combine all templates
  const allTemplates = [...PREBUILT_OVERLAYS, ...PREBUILT_WIDGETS]

  // Filter templates based on search and category
  const filteredTemplates = allTemplates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.data?.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.data?.tags?.some((tag: string) => tag.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory

    return matchesSearch && matchesCategory
  })

  const handleViewTemplate = (template: Asset) => {
    // Navigate to template preview page
    router.push(`/store/templates/${template.id}`)
  }

  const getTemplateIcon = (category: string) => {
    switch (category) {
      case 'overlays':
        return <Video className="w-5 h-5" />
      case 'widgets':
        return <Zap className="w-5 h-5" />
      default:
        return <Layers className="w-5 h-5" />
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Header */}
      <div className="relative bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 text-white py-20 px-8 overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto relative">
          <div className="flex items-center gap-3 mb-4">
            <ShoppingBag className="w-10 h-10" />
            <h1 className="text-5xl font-bold">Template Store</h1>
          </div>
          <p className="text-xl text-purple-50 max-w-2xl">
            Professional, ready-to-use templates for your Twitch stream. Customize and make them your own.
          </p>
          <div className="flex items-center gap-6 mt-6">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-white rounded-full"></div>
              <span className="text-purple-100">{PREBUILT_OVERLAYS.length} Overlays</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-white rounded-full"></div>
              <span className="text-purple-100">{PREBUILT_WIDGETS.length} Widgets</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-white rounded-full"></div>
              <span className="text-purple-100">{filteredTemplates.length} Total Items</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-8">
        {/* Category Filter Pills */}
        <div className="flex gap-3 mb-6">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 ${
              selectedCategory === 'all'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-xl scale-105'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 shadow-md'
            }`}
          >
            <Layers className="w-5 h-5" />
            All Items
          </button>
          <button
            onClick={() => setSelectedCategory('overlays')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 ${
              selectedCategory === 'overlays'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-xl scale-105'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 shadow-md'
            }`}
          >
            <Video className="w-5 h-5" />
            Overlays ({PREBUILT_OVERLAYS.length})
          </button>
          <button
            onClick={() => setSelectedCategory('widgets')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 ${
              selectedCategory === 'widgets'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-xl scale-105'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 shadow-md'
            }`}
          >
            <Zap className="w-5 h-5" />
            Widgets ({PREBUILT_WIDGETS.length})
          </button>
        </div>

        {/* Search & View Controls */}
        <div className="flex items-center gap-4 mb-8">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-secondary" />
            <input
              type="text"
              placeholder="Search store by name, description, or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border-2 border-border rounded-xl bg-background focus:ring-2 focus:ring-primary focus:border-primary transition-all text-base"
            />
          </div>

          {/* View Toggle */}
          <div className="flex gap-2 border-2 border-border rounded-xl p-1.5 bg-white dark:bg-gray-900">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-primary text-white shadow-md' : 'text-text-secondary hover:bg-gray-100 dark:hover:bg-gray-800'}`}
              title="Grid view"
            >
              <Grid3x3 className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2.5 rounded-lg transition-all ${viewMode === 'list' ? 'bg-primary text-white shadow-md' : 'text-text-secondary hover:bg-gray-100 dark:hover:bg-gray-800'}`}
              title="List view"
            >
              <List className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Templates Grid/List */}
        {filteredTemplates.length > 0 ? (
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'flex flex-col gap-4'}>
            {filteredTemplates.map((template) => (
              <Card
                key={template.id}
                className={`group relative overflow-hidden hover:shadow-2xl transition-all duration-300 border-2 hover:border-primary ${viewMode === 'list' ? 'flex items-center p-6' : 'p-0'}`}
              >
                {/* Template Preview */}
                <div className={`bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 rounded-lg flex items-center justify-center relative overflow-hidden ${viewMode === 'grid' ? 'aspect-video' : 'w-64 h-40 flex-shrink-0'}`}>
                  {(() => {
                    // Check if template has a 3D model
                    const modelShape = template.data?.shapes?.find((s: any) => s.type === '3d-model' && s.modelUrl)

                    if (modelShape) {
                      // Render 3D model preview
                      return (
                        <>
                          <div className="absolute inset-0 bg-black/90">
                            <GLBViewer
                              modelUrl={modelShape.modelUrl}
                              autoRotate={modelShape.autoRotate ?? true}
                            />
                          </div>
                          {/* Gradient overlay for depth */}
                          <div className="absolute inset-0 bg-gradient-to-t from-purple-900/20 via-transparent to-black/10 pointer-events-none" />
                        </>
                      )
                    }

                    // Check for video
                    const videoShape = template.data?.shapes?.find((s: any) => s.type === 'video' && s.videoUrl)

                    if (videoShape) {
                      return (
                        <>
                          <video
                            src={videoShape.videoUrl}
                            autoPlay
                            loop
                            muted
                            playsInline
                            className="absolute inset-0 w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20 pointer-events-none" />
                        </>
                      )
                    }

                    // Fallback to icon for templates without 3D/video
                    return (
                      <>
                        {/* Background pattern */}
                        <div className="absolute inset-0 opacity-10">
                          <div className="absolute inset-0" style={{
                            backgroundImage: 'radial-gradient(circle, #a855f7 1px, transparent 1px)',
                            backgroundSize: '20px 20px'
                          }}></div>
                        </div>

                        {/* Icon indicator */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-24 h-24 bg-gradient-to-br from-purple-400 to-pink-400 rounded-2xl flex items-center justify-center transform group-hover:scale-110 transition-transform shadow-xl">
                            {getTemplateIcon(template.category)}
                            <Sparkles className="w-8 h-8 text-white absolute -top-2 -right-2" />
                          </div>
                        </div>
                      </>
                    )
                  })()}

                  {/* Category badge */}
                  <div className="absolute top-3 left-3 z-10">
                    <span className="px-3 py-1.5 text-xs font-bold rounded-full bg-white/90 dark:bg-gray-900/90 text-purple-600 dark:text-purple-400 shadow-md uppercase tracking-wider">
                      {template.category}
                    </span>
                  </div>

                  {/* 3D Model badge */}
                  {template.data?.shapes?.find((s: any) => s.type === '3d-model') && (
                    <div className="absolute top-3 right-3 z-10">
                      <span className="px-3 py-1.5 text-xs font-bold rounded-full bg-purple-600/90 text-white shadow-md uppercase tracking-wider flex items-center gap-1">
                        <Box className="w-3 h-3" />
                        3D
                      </span>
                    </div>
                  )}

                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 z-10">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleViewTemplate(template)}
                      className="bg-white text-black hover:bg-gray-100 shadow-lg"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </Button>
                  </div>
                </div>

                {/* Template Info */}
                <div className={`${viewMode === 'grid' ? 'p-6' : 'flex-1 ml-6'}`}>
                  <h3 className="font-bold text-xl mb-2 group-hover:text-primary transition-colors">
                    {template.name}
                  </h3>

                  {template.data?.description && (
                    <p className="text-sm text-text-secondary mb-3 line-clamp-2">
                      {template.data.description}
                    </p>
                  )}

                  {/* Tags */}
                  {template.data?.tags && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {template.data.tags.slice(0, 3).map((tag: string) => (
                        <span
                          key={tag}
                          className="px-2.5 py-1 text-xs font-medium rounded-md bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300"
                        >
                          #{tag}
                        </span>
                      ))}
                      {template.data.tags.length > 3 && (
                        <span className="px-2.5 py-1 text-xs font-medium rounded-md bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                          +{template.data.tags.length - 3} more
                        </span>
                      )}
                    </div>
                  )}

                  {/* Stats */}
                  <div className="flex items-center gap-4 text-xs text-text-secondary mb-4">
                    <div className="flex items-center gap-1.5">
                      <Layers className="w-4 h-4" />
                      <span>{template.data?.shapes?.length || 0} components</span>
                    </div>
                    <span>•</span>
                    <span className="capitalize font-medium">{template.type}</span>
                  </div>

                  {/* Action Button */}
                  <Button
                    onClick={() => handleViewTemplate(template)}
                    className="w-full group/btn bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View Template
                    <ArrowRight className="w-4 h-4 ml-2 opacity-0 -translate-x-2 group-hover/btn:opacity-100 group-hover/btn:translate-x-0 transition-all" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="w-12 h-12 text-purple-400 opacity-50" />
            </div>
            <h3 className="text-2xl font-bold mb-3">No items found</h3>
            <p className="text-text-secondary mb-6 max-w-md mx-auto">
              {searchQuery
                ? `No items match "${searchQuery}". Try adjusting your search or filters.`
                : 'No items available in this category.'}
            </p>
            {searchQuery && (
              <Button onClick={() => setSearchQuery('')} variant="outline" size="lg">
                <Search className="w-4 h-4 mr-2" />
                Clear Search
              </Button>
            )}
          </div>
        )}

        {/* Info Section */}
        <div className="mt-16 grid md:grid-cols-3 gap-6">
          <Card className="p-6 border-2 hover:border-purple-200 dark:hover:border-purple-800 transition-colors">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mb-4">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-bold text-lg mb-2">Ready to Use</h3>
            <p className="text-sm text-text-secondary">
              All templates are professionally designed and ready to use. Just click and customize.
            </p>
          </Card>

          <Card className="p-6 border-2 hover:border-purple-200 dark:hover:border-purple-800 transition-colors">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mb-4">
              <Layers className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-bold text-lg mb-2">Fully Customizable</h3>
            <p className="text-sm text-text-secondary">
              Edit colors, text, layout, and more. Make each template uniquely yours.
            </p>
          </Card>

          <Card className="p-6 border-2 hover:border-purple-200 dark:hover:border-purple-800 transition-colors">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mb-4">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-bold text-lg mb-2">Save Time</h3>
            <p className="text-sm text-text-secondary">
              Skip the design process and go live faster with professional templates.
            </p>
          </Card>
        </div>
      </div>
    </div>
  )
}
