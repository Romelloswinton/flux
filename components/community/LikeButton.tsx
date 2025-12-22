'use client'

import { Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useLikeContent, useIsLiked, useLikesCount } from '@/lib/hooks/useSocial'

interface LikeButtonProps {
  entityType: 'project' | 'asset' | 'model_3d' | 'comment'
  entityId: string
  showCount?: boolean
  size?: 'sm' | 'md' | 'lg'
  variant?: 'ghost' | 'outline' | 'default'
}

export function LikeButton({
  entityType,
  entityId,
  showCount = true,
  size = 'sm',
  variant = 'ghost',
}: LikeButtonProps) {
  const { data: isLiked = false } = useIsLiked(entityType, entityId)
  const { data: likesCount = 0 } = useLikesCount(entityType, entityId)
  const likeContent = useLikeContent()

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()

    try {
      await likeContent.mutateAsync({ entityType, entityId, isLiked })
    } catch (error) {
      console.error('Failed to like content:', error)
    }
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleLike}
      disabled={likeContent.isPending}
      className={`gap-2 ${isLiked ? 'text-red-500 hover:text-red-600' : 'text-gray-600 hover:text-red-500'}`}
    >
      <Heart
        className={`w-4 h-4 transition-all ${isLiked ? 'fill-current scale-110' : ''}`}
      />
      {showCount && <span className="text-sm font-medium">{likesCount}</span>}
    </Button>
  )
}
