/**
 * Projects Page - Gallery of user's projects
 *
 * Displays all projects with thumbnails, search, and filtering.
 */

'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useProjects, useCreateProject, useDeleteProject, useDuplicateProject } from '@/lib/hooks/useProjects'
import { useAuth } from '@/lib/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Plus, Search, Grid3x3, List, MoreVertical, Pencil, Copy, Trash2, User, Settings, LogOut } from 'lucide-react'

export default function ProjectsPage() {
  const router = useRouter()
  const { data: projects, isLoading } = useProjects()
  const { user, signOut } = useAuth()
  const createProject = useCreateProject()
  const deleteProject = useDeleteProject()
  const duplicateProject = useDuplicateProject()

  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const getUserInitials = () => {
    if (!user?.user_metadata?.full_name) return 'U'
    const names = user.user_metadata.full_name.split(' ')
    if (names.length >= 2) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase()
    }
    return names[0][0].toUpperCase()
  }

  const handleLogout = async () => {
    await signOut()
    router.push('/auth/login')
  }

  const handleNewProject = async () => {
    if (!user) return

    try {
      const newProject = await createProject.mutateAsync({
        owner_id: user.id,
        name: 'Untitled Overlay',
        project_data: { shapes: [], layers: [] },
      } as any)
      router.push(`/dashboard/overlay-builder`)
    } catch (error) {
      console.error('Failed to create project:', error)
    }
  }

  const handleOpenProject = (projectId: string) => {
    router.push(`/dashboard/overlay-builder?id=${projectId}`)
  }

  const handleDuplicate = async (projectId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      await duplicateProject.mutateAsync(projectId)
      setOpenMenuId(null)
    } catch (error) {
      console.error('Failed to duplicate project:', error)
    }
  }

  const handleDelete = async (projectId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        await deleteProject.mutateAsync(projectId)
        setOpenMenuId(null)
      } catch (error) {
        console.error('Failed to delete project:', error)
      }
    }
  }

  const filteredProjects = projects?.filter(project =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.description?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-text-secondary">Loading projects...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">My Projects</h1>
            <p className="text-text-secondary">
              {projects?.length || 0} {projects?.length === 1 ? 'project' : 'projects'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={handleNewProject}
              disabled={createProject.isPending}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              {createProject.isPending ? 'Creating...' : 'New Project'}
            </Button>

            {/* Profile Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold hover:shadow-lg transition-shadow border-2 border-white shadow-md"
                title={user?.user_metadata?.full_name || user?.email || 'Profile'}
              >
                {getUserInitials()}
              </button>

              {/* Dropdown Menu */}
              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-border py-2 z-50">
                  {/* User Info */}
                  <div className="px-4 py-3 border-b border-border">
                    <div className="font-medium text-sm">
                      {user?.user_metadata?.full_name || 'User'}
                    </div>
                    <div className="text-xs text-gray-500 truncate">
                      {user?.email}
                    </div>
                  </div>

                  {/* Profile Option */}
                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false)
                      router.push('/dashboard/profile')
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <User className="w-4 h-4" />
                    <span>Profile</span>
                  </button>

                  {/* Settings Option */}
                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false)
                      router.push('/dashboard/settings')
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <Settings className="w-4 h-4" />
                    <span>Settings</span>
                  </button>

                  <div className="border-t border-border my-2"></div>

                  {/* Logout */}
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-4 mb-6">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-secondary" />
            <input
              type="text"
              placeholder="Search projects..."
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

        {/* Projects Grid/List */}
        {filteredProjects && filteredProjects.length > 0 ? (
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'flex flex-col gap-4'}>
            {filteredProjects.map((project) => (
              <Card
                key={project.id}
                className={`group cursor-pointer hover:shadow-lg transition-shadow relative ${viewMode === 'list' ? 'flex items-center p-4' : 'p-4'}`}
                onClick={() => handleOpenProject(project.id)}
              >
                {/* Thumbnail */}
                <div className={`bg-surface rounded-md flex items-center justify-center mb-3 ${viewMode === 'grid' ? 'aspect-video' : 'w-32 h-20 flex-shrink-0'}`}>
                  {project.thumbnail_url ? (
                    <img
                      src={project.thumbnail_url}
                      alt={project.name}
                      className="w-full h-full object-cover rounded-md"
                    />
                  ) : (
                    <div className="text-text-secondary text-sm">No thumbnail</div>
                  )}
                </div>

                {/* Info */}
                <div className={viewMode === 'list' ? 'flex-1 ml-4' : ''}>
                  <h3 className="font-semibold text-lg mb-1 truncate">{project.name}</h3>
                  {project.description && (
                    <p className="text-sm text-text-secondary mb-2 line-clamp-2">{project.description}</p>
                  )}
                  <div className="flex items-center gap-3 text-xs text-text-secondary">
                    <span>{new Date(project.updated_at).toLocaleDateString()}</span>
                    <span>•</span>
                    <span>{project.canvas_width}x{project.canvas_height}</span>
                  </div>
                </div>

                {/* Actions Menu */}
                <div className="absolute top-2 right-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setOpenMenuId(openMenuId === project.id ? null : project.id)
                    }}
                    className="p-2 rounded-md bg-surface opacity-0 group-hover:opacity-100 transition-opacity hover:bg-surface-hover"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>

                  {openMenuId === project.id && (
                    <div className="absolute right-0 mt-2 w-48 bg-surface border border-border rounded-md shadow-lg z-10">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleOpenProject(project.id)
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-surface-hover"
                      >
                        <Pencil className="w-4 h-4" />
                        Open
                      </button>
                      <button
                        onClick={(e) => handleDuplicate(project.id, e)}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-surface-hover"
                        disabled={duplicateProject.isPending}
                      >
                        <Copy className="w-4 h-4" />
                        Duplicate
                      </button>
                      <button
                        onClick={(e) => handleDelete(project.id, e)}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-surface-hover"
                        disabled={deleteProject.isPending}
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="mb-4">
              <div className="w-24 h-24 bg-surface rounded-full flex items-center justify-center mx-auto mb-4">
                <Plus className="w-12 h-12 text-text-secondary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No projects yet</h3>
              <p className="text-text-secondary mb-6">
                {searchQuery
                  ? `No projects match "${searchQuery}"`
                  : 'Create your first overlay project to get started'}
              </p>
              {!searchQuery && (
                <Button onClick={handleNewProject} disabled={createProject.isPending}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Project
                </Button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Click outside to close menu */}
      {openMenuId && (
        <div
          className="fixed inset-0 z-5"
          onClick={() => setOpenMenuId(null)}
        />
      )}
    </div>
  )
}
