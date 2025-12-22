'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  usePublicProjects,
  usePublicAssets,
  usePublic3DModels,
} from '@/lib/hooks/usePublicContent'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Search,
  TrendingUp,
  Clock,
  Heart,
  Download,
  Sparkles,
  Box,
  Layers,
  Image,
  Grid3x3,
  List,
  Filter,
} from 'lucide-react'
import { LikeButton } from '@/components/community/LikeButton'
import { ShareButton } from '@/components/community/ShareButton'

type ContentType = 'all' | 'projects' | 'assets' | '3d-models'
type SortBy = 'recent' | 'popular' | 'trending'

export default function DiscoverPage() {
  const router = useRouter()
  const [contentType, setContentType] = useState<ContentType>('all')
  const [sortBy, setSortBy] = useState<SortBy>('recent')
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  const { data: projects = [], isLoading: loadingProjects } = usePublicProjects({
    search: searchQuery,
    sortBy,
    limit: 20,
  })

  const { data: assets = [], isLoading: loadingAssets } = usePublicAssets({
    search: searchQuery,
    sortBy,
    limit: 20,
  })

  const { data: models = [], isLoading: loading3DModels } = usePublic3DModels({
    search: searchQuery,
    sortBy,
    limit: 20,
  })

  const isLoading = loadingProjects || loadingAssets || loading3DModels

  const filteredContent = () => {
    switch (contentType) {
      case 'projects':
        return projects.map((p) => ({ ...p, type: 'project' as const }))
      case 'assets':
        return assets.map((a) => ({ ...a, type: 'asset' as const }))
      case '3d-models':
        return models.map((m) => ({ ...m, type: '3d-model' as const }))
      default:
        return [
          ...projects.map((p) => ({ ...p, type: 'project' as const })),
          ...assets.map((a) => ({ ...a, type: 'asset' as const })),
          ...models.map((m) => ({ ...m, type: '3d-model' as const })),
        ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    }
  }

  const content = filteredContent()

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Header */}
      <div className="relative bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 text-white py-16 px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <Sparkles className="w-12 h-12" />
            <h1 className="text-5xl font-bold">Discover</h1>
          </div>
          <p className="text-xl text-purple-50 max-w-2xl">
            Explore amazing content created by the Arc3D community
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-8">
        {/* Filters & Search */}
        <div className="space-y-6 mb-8">
          {/* Content Type Tabs */}
          <div className="flex flex-wrap gap-3">
            {[
              { value: 'all', label: 'All Content', icon: Layers },
              { value: 'projects', label: 'Projects', icon: Image },
              { value: 'assets', label: 'Assets', icon: Box },
              { value: '3d-models', label: '3D Models', icon: Box },
            ].map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                onClick={() => setContentType(value as ContentType)}
                className={`px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 ${
                  contentType === value
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-xl scale-105'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 shadow-md'
                }`}
              >
                <Icon className="w-5 h-5" />
                {label}
              </button>
            ))}
          </div>

          {/* Search & Sort */}
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search content..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-4 py-6 text-base"
              />
            </div>

            {/* Sort */}
            <div className="flex gap-2 bg-white dark:bg-gray-900 border-2 border-border rounded-xl p-1.5">
              {[
                { value: 'recent', label: 'Recent', icon: Clock },
                { value: 'popular', label: 'Popular', icon: Heart },
                { value: 'trending', label: 'Trending', icon: TrendingUp },
              ].map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  onClick={() => setSortBy(value as SortBy)}
                  className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${
                    sortBy === value
                      ? 'bg-primary text-white shadow-md'
                      : 'text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{label}</span>
                </button>
              ))}
            </div>

            {/* View Mode */}
            <div className="flex gap-2 border-2 border-border rounded-xl p-1.5 bg-white dark:bg-gray-900">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2.5 rounded-lg transition-all ${
                  viewMode === 'grid'
                    ? 'bg-primary text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <Grid3x3 className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2.5 rounded-lg transition-all ${
                  viewMode === 'list'
                    ? 'bg-primary text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Content Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="p-6 animate-pulse">
                <div className="aspect-video bg-gray-200 dark:bg-gray-800 rounded-lg mb-4" />
                <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded mb-2" />
                <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-2/3" />
              </Card>
            ))}
          </div>
        ) : content.length === 0 ? (
          <div className="text-center py-20">
            <Sparkles className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-2xl font-bold mb-2">No content found</h3>
            <p className="text-gray-500">
              {searchQuery
                ? `No results for "${searchQuery}"`
                : 'No public content available yet'}
            </p>
          </div>
        ) : (
          <div
            className={
              viewMode === 'grid'
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                : 'flex flex-col gap-4'
            }
          >
            {content.map((item) => (
              <ContentCard key={item.id} item={item} viewMode={viewMode} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function ContentCard({
  item,
  viewMode,
}: {
  item: any
  viewMode: 'grid' | 'list'
}) {
  const router = useRouter()

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'project':
        return <Image className="w-4 h-4" />
      case 'asset':
        return <Layers className="w-4 h-4" />
      case '3d-model':
        return <Box className="w-4 h-4" />
      default:
        return <Layers className="w-4 h-4" />
    }
  }

  const getEntityType = (type: string) => {
    if (type === '3d-model') return 'model_3d'
    return type
  }

  return (
    <Card
      className={`group hover:shadow-2xl transition-all duration-300 border-2 hover:border-primary cursor-pointer ${
        viewMode === 'list' ? 'flex items-center p-6' : 'overflow-hidden'
      }`}
      onClick={() => router.push(`/dashboard/${item.type}s/${item.id}`)}
    >
      {/* Thumbnail */}
      <div
        className={`bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 rounded-lg flex items-center justify-center relative overflow-hidden ${
          viewMode === 'grid' ? 'aspect-video' : 'w-48 h-32 flex-shrink-0'
        }`}
      >
        {item.thumbnail_url ? (
          <img
            src={item.thumbnail_url}
            alt={item.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full">
            <Box className="w-12 h-12 text-purple-300" />
          </div>
        )}

        {/* Type Badge */}
        <div className="absolute top-3 left-3">
          <span className="px-3 py-1.5 text-xs font-bold rounded-full bg-white/90 dark:bg-gray-900/90 text-purple-600 shadow-md flex items-center gap-1">
            {getTypeIcon(item.type)}
            {item.type}
          </span>
        </div>
      </div>

      {/* Content Info */}
      <div className={`${viewMode === 'grid' ? 'p-6' : 'flex-1 ml-6'}`}>
        <h3 className="font-bold text-xl mb-2 group-hover:text-primary transition-colors line-clamp-1">
          {item.name}
        </h3>

        {item.description && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
            {item.description}
          </p>
        )}

        {/* Tags */}
        {item.tags && item.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {item.tags.slice(0, 3).map((tag: string) => (
              <span
                key={tag}
                className="px-2.5 py-1 text-xs font-medium rounded-md bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Stats & Actions */}
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-4">
            <LikeButton
              entityType={getEntityType(item.type) as any}
              entityId={item.id}
              showCount={true}
              size="sm"
            />
            {item.download_count !== undefined && (
              <div className="flex items-center gap-1 text-sm text-gray-600">
                <Download className="w-4 h-4" />
                <span>{item.download_count}</span>
              </div>
            )}
          </div>
          <ShareButton
            title={item.name}
            entityType={item.type}
            size="sm"
            variant="ghost"
          />
        </div>
      </div>
    </Card>
  )
}
