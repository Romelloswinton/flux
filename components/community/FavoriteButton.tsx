'use client'

import { Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useToggleFavorite } from '@/lib/hooks/useAssets'
import { useState } from 'react'

interface FavoriteButtonProps {
  assetId: string
  initialIsFavorite?: boolean
  showCount?: boolean
  favoriteCount?: number
  size?: 'sm' | 'md' | 'lg'
  variant?: 'ghost' | 'outline' | 'default'
}

export function FavoriteButton({
  assetId,
  initialIsFavorite = false,
  showCount = false,
  favoriteCount = 0,
  size = 'md',
  variant = 'ghost',
}: FavoriteButtonProps) {
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite)
  const [count, setCount] = useState(favoriteCount)
  const toggleFavorite = useToggleFavorite()

  const handleToggle = async (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()

    const newIsFavorite = !isFavorite
    setIsFavorite(newIsFavorite)
    setCount(prev => newIsFavorite ? prev + 1 : Math.max(0, prev - 1))

    try {
      await toggleFavorite.mutateAsync({ assetId, isFavorite })
    } catch (error) {
      // Revert on error
      setIsFavorite(!newIsFavorite)
      setCount(favoriteCount)
      console.error('Failed to toggle favorite:', error)
    }
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleToggle}
      disabled={toggleFavorite.isPending}
      className={`gap-2 ${isFavorite ? 'text-red-500 hover:text-red-600' : ''}`}
    >
      <Heart
        className={`w-4 h-4 transition-all ${isFavorite ? 'fill-current' : ''}`}
      />
      {showCount && <span className="text-sm">{count}</span>}
    </Button>
  )
}
