'use client'

import { useGLTF } from '@react-three/drei'
import { useEffect } from 'react'
import type { Transform3D } from '@/lib/types/3d'

interface ModelViewerProps {
  modelUrl: string
  transform?: Transform3D
  onLoad?: () => void
}

export function ModelViewer({ modelUrl, transform, onLoad }: ModelViewerProps) {
  const { scene } = useGLTF(modelUrl)

  useEffect(() => {
    if (scene && onLoad) {
      onLoad()
    }
  }, [scene, onLoad])

  return (
    <primitive
      object={scene}
      position={transform?.position || [0, 0, 0]}
      rotation={transform?.rotation || [0, 0, 0]}
      scale={transform?.scale || [1, 1, 1]}
    />
  )
}

// Preload utility
export function preload3DModel(url: string) {
  useGLTF.preload(url)
}
