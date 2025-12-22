'use client'

import { useState } from 'react'
import { Users, UserPlus, Mail, Loader2, Trash2, Shield, Eye, Edit2, Check, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import {
  useCollaborators,
  useInviteCollaborator,
  useRemoveCollaborator,
  useUpdateCollaboratorRole,
  type ProjectCollaborator,
} from '@/lib/hooks/useCollaboration'

interface CollaborationPanelProps {
  projectId: string
}

export function CollaborationPanel({ projectId }: CollaborationPanelProps) {
  const { data: collaborators = [], isLoading } = useCollaborators(projectId)
  const inviteCollaborator = useInviteCollaborator()
  const removeCollaborator = useRemoveCollaborator()
  const updateRole = useUpdateCollaboratorRole()

  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<'editor' | 'viewer'>('editor')
  const [showInviteForm, setShowInviteForm] = useState(false)

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inviteEmail.trim()) return

    try {
      await inviteCollaborator.mutateAsync({
        projectId,
        userEmail: inviteEmail,
        role: inviteRole,
      })
      setInviteEmail('')
      setShowInviteForm(false)
      alert('Collaboration invite sent!')
    } catch (error: any) {
      alert(error.message || 'Failed to send invite')
    }
  }

  const handleRemove = async (userId: string) => {
    if (!confirm('Remove this collaborator?')) return

    try {
      await removeCollaborator.mutateAsync({ projectId, userId })
    } catch (error) {
      alert('Failed to remove collaborator')
    }
  }

  const handleRoleChange = async (userId: string, newRole: 'editor' | 'viewer') => {
    try {
      await updateRole.mutateAsync({ projectId, userId, role: newRole })
    } catch (error) {
      alert('Failed to update role')
    }
  }

  const getInitials = (name: string | null) => {
    if (!name) return 'U'
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner':
        return <Shield className="w-4 h-4" />
      case 'editor':
        return <Edit2 className="w-4 h-4" />
      case 'viewer':
        return <Eye className="w-4 h-4" />
      default:
        return <Users className="w-4 h-4" />
    }
  }

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          <h3 className="font-semibold text-lg">Collaborators</h3>
          <span className="text-sm text-gray-500">({collaborators.length})</span>
        </div>
        <Button
          size="sm"
          onClick={() => setShowInviteForm(!showInviteForm)}
          variant={showInviteForm ? 'outline' : 'default'}
        >
          {showInviteForm ? (
            <>
              <X className="w-4 h-4 mr-2" />
              Cancel
            </>
          ) : (
            <>
              <UserPlus className="w-4 h-4 mr-2" />
              Invite
            </>
          )}
        </Button>
      </div>

      {/* Invite Form */}
      {showInviteForm && (
        <form onSubmit={handleInvite} className="mb-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg space-y-3">
          <div>
            <label className="text-sm font-medium mb-1 block">Email Address</label>
            <Input
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="collaborator@example.com"
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Role</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setInviteRole('editor')}
                className={`flex-1 px-3 py-2 rounded-md border-2 transition-all ${
                  inviteRole === 'editor'
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <Edit2 className="w-4 h-4" />
                  <span className="font-medium">Editor</span>
                </div>
                <p className="text-xs mt-1">Can edit the project</p>
              </button>
              <button
                type="button"
                onClick={() => setInviteRole('viewer')}
                className={`flex-1 px-3 py-2 rounded-md border-2 transition-all ${
                  inviteRole === 'viewer'
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <Eye className="w-4 h-4" />
                  <span className="font-medium">Viewer</span>
                </div>
                <p className="text-xs mt-1">Can only view</p>
              </button>
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={inviteCollaborator.isPending}>
            {inviteCollaborator.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Mail className="w-4 h-4 mr-2" />
                Send Invite
              </>
            )}
          </Button>
        </form>
      )}

      {/* Collaborators List */}
      <div className="space-y-3">
        {collaborators.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No collaborators yet</p>
            <p className="text-xs mt-1">Invite team members to collaborate</p>
          </div>
        ) : (
          collaborators.map((collab) => (
            <div
              key={collab.user_id}
              className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
            >
              <div className="flex items-center gap-3">
                {/* Avatar */}
                {collab.profile?.avatar_url ? (
                  <img
                    src={collab.profile.avatar_url}
                    alt={collab.profile.full_name || 'User'}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-sm font-bold">
                    {getInitials(collab.profile?.full_name || null)}
                  </div>
                )}

                {/* Info */}
                <div>
                  <p className="font-medium text-sm">
                    {collab.profile?.full_name || collab.profile?.email}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      {getRoleIcon(collab.role)}
                      <span className="capitalize">{collab.role}</span>
                    </div>
                    {!collab.accepted_at && (
                      <span className="text-xs text-orange-600 dark:text-orange-400">
                        • Pending
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions */}
              {collab.role !== 'owner' && (
                <div className="flex items-center gap-2">
                  {/* Role Toggle */}
                  {collab.accepted_at && (
                    <select
                      value={collab.role}
                      onChange={(e) =>
                        handleRoleChange(collab.user_id, e.target.value as 'editor' | 'viewer')
                      }
                      className="text-xs border border-border rounded px-2 py-1"
                      disabled={updateRole.isPending}
                    >
                      <option value="editor">Editor</option>
                      <option value="viewer">Viewer</option>
                    </select>
                  )}

                  {/* Remove Button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemove(collab.user_id)}
                    disabled={removeCollaborator.isPending}
                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </Card>
  )
}
