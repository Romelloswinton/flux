'use client'

import { UserPlus, UserMinus, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useFollowUser, useUnfollowUser, useIsFollowing } from '@/lib/hooks/useSocial'

interface FollowButtonProps {
  userId: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'outline'
  showIcon?: boolean
}

export function FollowButton({
  userId,
  size = 'md',
  variant = 'default',
  showIcon = true,
}: FollowButtonProps) {
  const { data: isFollowing = false, isLoading } = useIsFollowing(userId)
  const followUser = useFollowUser()
  const unfollowUser = useUnfollowUser()

  const handleToggleFollow = async (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()

    try {
      if (isFollowing) {
        await unfollowUser.mutateAsync(userId)
      } else {
        await followUser.mutateAsync(userId)
      }
    } catch (error) {
      console.error('Failed to toggle follow:', error)
    }
  }

  if (isLoading) {
    return (
      <Button variant={variant} size={size} disabled>
        <Loader2 className="w-4 h-4 animate-spin" />
      </Button>
    )
  }

  return (
    <Button
      variant={isFollowing ? 'outline' : variant}
      size={size}
      onClick={handleToggleFollow}
      disabled={followUser.isPending || unfollowUser.isPending}
      className="gap-2"
    >
      {showIcon && (isFollowing ? <UserMinus className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />)}
      {isFollowing ? 'Following' : 'Follow'}
    </Button>
  )
}
