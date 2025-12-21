"use client"

import { useEditor, track, DefaultColorStyle, DefaultFillStyle, DefaultSizeStyle } from 'tldraw'
import Draggable from 'react-draggable'
import { useState } from 'react'
import { Palette, Move, X, Minimize2 } from 'lucide-react'

export const CustomStylePanel = track(() => {
  const editor = useEditor()
  const [isMinimized, setIsMinimized] = useState(false)
  const [position, setPosition] = useState({ x: 20, y: 100 })

  const selectedShapes = editor.getSelectedShapes()

  if (selectedShapes.length === 0) {
    return null
  }

  const colors = ['black', 'grey', 'light-violet', 'violet', 'blue', 'light-blue', 'yellow', 'orange', 'green', 'light-green', 'light-red', 'red']
  const sizes = ['s', 'm', 'l', 'xl']
  const fillStyles = ['none', 'semi', 'solid', 'pattern']

  const currentColor = editor.getSharedStyles().get(DefaultColorStyle)
  const currentSize = editor.getSharedStyles().get(DefaultSizeStyle)
  const currentFill = editor.getSharedStyles().get(DefaultFillStyle)

  const handleColorChange = (color: string) => {
    editor.setStyleForSelectedShapes(DefaultColorStyle, color as any)
  }

  const handleSizeChange = (size: string) => {
    editor.setStyleForSelectedShapes(DefaultSizeStyle, size as any)
  }

  const handleFillChange = (fill: string) => {
    editor.setStyleForSelectedShapes(DefaultFillStyle, fill as any)
  }

  if (isMinimized) {
    return (
      <Draggable
        handle=".drag-handle"
        position={position}
        onStop={(e, data) => setPosition({ x: data.x, y: data.y })}
      >
        <div className="fixed bg-white dark:bg-gray-900 rounded-lg shadow-2xl border-2 border-purple-500 z-50"
             style={{ pointerEvents: 'all' }}>
          <div className="drag-handle cursor-move flex items-center justify-between p-3 bg-gradient-to-r from-purple-500 to-pink-500">
            <div className="flex items-center gap-2 text-white">
              <Palette className="w-4 h-4" />
              <span className="font-semibold text-sm">Styles</span>
            </div>
            <button
              onClick={() => setIsMinimized(false)}
              className="text-white hover:bg-white/20 rounded p-1 transition-colors"
            >
              <Minimize2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </Draggable>
    )
  }

  return (
    <Draggable
      handle=".drag-handle"
      position={position}
      onStop={(e, data) => setPosition({ x: data.x, y: data.y })}
    >
      <div className="fixed bg-white dark:bg-gray-900 rounded-lg shadow-2xl border-2 border-purple-500 w-72 z-50"
           style={{ pointerEvents: 'all' }}>
        {/* Header */}
        <div className="drag-handle cursor-move flex items-center justify-between p-3 bg-gradient-to-r from-purple-500 to-pink-500">
          <div className="flex items-center gap-2 text-white">
            <Palette className="w-5 h-5" />
            <span className="font-semibold">Style Panel</span>
            <Move className="w-4 h-4 opacity-60" />
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsMinimized(true)}
              className="text-white hover:bg-white/20 rounded p-1 transition-colors"
            >
              <Minimize2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Color Picker */}
          <div>
            <label className="text-sm font-medium mb-2 block">Color</label>
            <div className="grid grid-cols-6 gap-2">
              {colors.map((color) => (
                <button
                  key={color}
                  onClick={() => handleColorChange(color)}
                  className={`w-8 h-8 rounded-md border-2 transition-transform hover:scale-110 ${
                    currentColor?.type === 'shared' && currentColor?.value === color ? 'border-purple-500 ring-2 ring-purple-300' : 'border-gray-300'
                  }`}
                  style={{
                    backgroundColor: color.includes('light')
                      ? `var(--palette-${color})`
                      : color === 'grey' ? '#9ca3af' : color
                  }}
                  title={color}
                />
              ))}
            </div>
          </div>

          {/* Size Picker */}
          <div>
            <label className="text-sm font-medium mb-2 block">Size</label>
            <div className="flex gap-2">
              {sizes.map((size) => (
                <button
                  key={size}
                  onClick={() => handleSizeChange(size)}
                  className={`flex-1 py-2 px-3 rounded-md border-2 text-sm font-medium transition-all ${
                    currentSize?.type === 'shared' && currentSize?.value === size
                      ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 text-purple-600'
                      : 'border-gray-300 hover:border-purple-300'
                  }`}
                >
                  {size.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Fill Style Picker */}
          <div>
            <label className="text-sm font-medium mb-2 block">Fill</label>
            <div className="grid grid-cols-2 gap-2">
              {fillStyles.map((fill) => (
                <button
                  key={fill}
                  onClick={() => handleFillChange(fill)}
                  className={`py-2 px-3 rounded-md border-2 text-sm font-medium capitalize transition-all ${
                    currentFill?.type === 'shared' && currentFill?.value === fill
                      ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 text-purple-600'
                      : 'border-gray-300 hover:border-purple-300'
                  }`}
                >
                  {fill}
                </button>
              ))}
            </div>
          </div>

          {/* Selection Info */}
          <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500">
              {selectedShapes.length} shape{selectedShapes.length !== 1 ? 's' : ''} selected
            </p>
          </div>
        </div>
      </div>
    </Draggable>
  )
})
