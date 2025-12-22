'use client'

import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { RotateCw, Move, Maximize2 } from 'lucide-react'
import type { Transform3D } from '@/lib/types/3d'

interface ModelControlsProps {
  transform: Transform3D
  onTransformChange: (transform: Transform3D) => void
}

export function ModelControls({ transform, onTransformChange }: ModelControlsProps) {
  const updatePosition = (axis: 0 | 1 | 2, value: number) => {
    const newPosition = [...transform.position] as [number, number, number]
    newPosition[axis] = value
    onTransformChange({ ...transform, position: newPosition })
  }

  const updateRotation = (axis: 0 | 1 | 2, value: number) => {
    const newRotation = [...transform.rotation] as [number, number, number]
    newRotation[axis] = value * (Math.PI / 180) // Convert to radians
    onTransformChange({ ...transform, rotation: newRotation })
  }

  const updateScale = (value: number) => {
    onTransformChange({ ...transform, scale: [value, value, value] })
  }

  const resetTransform = () => {
    onTransformChange({
      position: [0, 0, 0],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
    })
  }

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">Transform Controls</h3>
        <Button variant="ghost" size="sm" onClick={resetTransform}>
          Reset
        </Button>
      </div>

      {/* Position */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Move className="w-4 h-4" />
          <span className="text-sm font-medium">Position</span>
        </div>

        <div className="space-y-2">
          <div>
            <label className="text-xs text-muted-foreground">X: {transform.position[0].toFixed(2)}</label>
            <Slider
              value={[transform.position[0]]}
              onValueChange={([value]) => updatePosition(0, value)}
              min={-5}
              max={5}
              step={0.1}
              className="mt-1"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Y: {transform.position[1].toFixed(2)}</label>
            <Slider
              value={[transform.position[1]]}
              onValueChange={([value]) => updatePosition(1, value)}
              min={-5}
              max={5}
              step={0.1}
              className="mt-1"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Z: {transform.position[2].toFixed(2)}</label>
            <Slider
              value={[transform.position[2]]}
              onValueChange={([value]) => updatePosition(2, value)}
              min={-5}
              max={5}
              step={0.1}
              className="mt-1"
            />
          </div>
        </div>
      </div>

      {/* Rotation */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <RotateCw className="w-4 h-4" />
          <span className="text-sm font-medium">Rotation</span>
        </div>

        <div className="space-y-2">
          <div>
            <label className="text-xs text-muted-foreground">X: {(transform.rotation[0] * (180 / Math.PI)).toFixed(0)}°</label>
            <Slider
              value={[transform.rotation[0] * (180 / Math.PI)]}
              onValueChange={([value]) => updateRotation(0, value)}
              min={0}
              max={360}
              step={1}
              className="mt-1"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Y: {(transform.rotation[1] * (180 / Math.PI)).toFixed(0)}°</label>
            <Slider
              value={[transform.rotation[1] * (180 / Math.PI)]}
              onValueChange={([value]) => updateRotation(1, value)}
              min={0}
              max={360}
              step={1}
              className="mt-1"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Z: {(transform.rotation[2] * (180 / Math.PI)).toFixed(0)}°</label>
            <Slider
              value={[transform.rotation[2] * (180 / Math.PI)]}
              onValueChange={([value]) => updateRotation(2, value)}
              min={0}
              max={360}
              step={1}
              className="mt-1"
            />
          </div>
        </div>
      </div>

      {/* Scale */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Maximize2 className="w-4 h-4" />
          <span className="text-sm font-medium">Scale</span>
        </div>

        <div>
          <label className="text-xs text-muted-foreground">Size: {transform.scale[0].toFixed(2)}x</label>
          <Slider
            value={[transform.scale[0]]}
            onValueChange={([value]) => updateScale(value)}
            min={0.1}
            max={5}
            step={0.1}
            className="mt-1"
          />
        </div>
      </div>
    </div>
  )
}
