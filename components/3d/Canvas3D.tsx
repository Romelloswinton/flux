'use client'

import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment, Grid } from '@react-three/drei'
import { Suspense } from 'react'
import { Loader2 } from 'lucide-react'

interface Canvas3DProps {
  children: React.ReactNode
  showGrid?: boolean
  cameraPosition?: [number, number, number]
}

export function Canvas3D({
  children,
  showGrid = true,
  cameraPosition = [0, 2, 5]
}: Canvas3DProps) {
  return (
    <Canvas
      camera={{ position: cameraPosition, fov: 50 }}
      style={{ width: '100%', height: '100%', background: '#1a1a1a' }}
    >
      {/* Lighting */}
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <pointLight position={[-10, -10, -5]} intensity={0.5} />

      {/* Environment */}
      <Environment preset="studio" />

      {/* Grid */}
      {showGrid && <Grid args={[10, 10]} cellColor="#6e6e6e" sectionColor="#9d4b4b" />}

      {/* Camera Controls */}
      <OrbitControls makeDefault />

      {/* User Content */}
      <Suspense fallback={null}>
        {children}
      </Suspense>
    </Canvas>
  )
}

export function Canvas3DLoader() {
  return (
    <div className="w-full h-full flex items-center justify-center bg-[#1a1a1a]">
      <div className="flex flex-col items-center gap-2">
        <Loader2 className="w-8 h-8 animate-spin text-white" />
        <span className="text-sm text-gray-400">Loading 3D scene...</span>
      </div>
    </div>
  )
}
