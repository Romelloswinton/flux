"use client"

import { useEditor, track, TLShape, TLShapeId } from 'tldraw'
import Draggable from 'react-draggable'
import { useState } from 'react'
import { Layers, Move, Minimize2, Eye, EyeOff, Lock, Unlock, Trash2 } from 'lucide-react'

export const CustomLayersPanel = track(() => {
  const editor = useEditor()
  const [isMinimized, setIsMinimized] = useState(false)
  const [position, setPosition] = useState({ x: 20, y: 300 })

  const shapes = editor.getCurrentPageShapes()
  const selectedIds = editor.getSelectedShapeIds()

  const handleSelectShape = (shapeId: TLShapeId, event: React.MouseEvent) => {
    if (event.shiftKey) {
      editor.select(...selectedIds, shapeId)
    } else {
      editor.select(shapeId)
    }
  }

  const handleToggleVisibility = (shape: TLShape, event: React.MouseEvent) => {
    event.stopPropagation()
    const isHidden = shape.meta?.hidden === true
    editor.updateShape({
      ...shape,
      meta: { ...shape.meta, hidden: !isHidden }
    })
  }

  const handleToggleLock = (shape: TLShape, event: React.MouseEvent) => {
    event.stopPropagation()
    editor.updateShape({
      ...shape,
      isLocked: !shape.isLocked
    })
  }

  const handleDeleteShape = (shapeId: TLShapeId, event: React.MouseEvent) => {
    event.stopPropagation()
    editor.deleteShapes([shapeId])
  }

  const getShapeIcon = (type: string) => {
    switch (type) {
      case 'text': return 'T'
      case 'rectangle': return '□'
      case 'ellipse': return '○'
      case 'arrow': return '→'
      case 'draw': return '✎'
      default: return '◆'
    }
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
              <Layers className="w-4 h-4" />
              <span className="font-semibold text-sm">Layers ({shapes.length})</span>
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
      <div className="fixed bg-white dark:bg-gray-900 rounded-lg shadow-2xl border-2 border-purple-500 w-80 max-h-96 flex flex-col z-50"
           style={{ pointerEvents: 'all' }}>
        {/* Header */}
        <div className="drag-handle cursor-move flex items-center justify-between p-3 bg-gradient-to-r from-purple-500 to-pink-500 flex-shrink-0">
          <div className="flex items-center gap-2 text-white">
            <Layers className="w-5 h-5" />
            <span className="font-semibold">Layers</span>
            <Move className="w-4 h-4 opacity-60" />
          </div>
          <button
            onClick={() => setIsMinimized(true)}
            className="text-white hover:bg-white/20 rounded p-1 transition-colors"
          >
            <Minimize2 className="w-4 h-4" />
          </button>
        </div>

        {/* Layers List */}
        <div className="overflow-y-auto flex-1">
          {shapes.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              <Layers className="w-12 h-12 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No layers yet</p>
              <p className="text-xs mt-1">Start drawing to create layers</p>
            </div>
          ) : (
            <div className="p-2 space-y-1">
              {shapes.slice().reverse().map((shape, index) => {
                const isSelected = selectedIds.includes(shape.id)
                const isHidden = shape.meta?.hidden === true
                const isLocked = shape.isLocked

                return (
                  <div
                    key={shape.id}
                    onClick={(e) => handleSelectShape(shape.id, e)}
                    className={`group flex items-center gap-2 p-2 rounded-md cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-purple-100 dark:bg-purple-900/30 border-2 border-purple-500'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-800 border-2 border-transparent'
                    } ${isHidden ? 'opacity-50' : ''}`}
                  >
                    {/* Shape Icon */}
                    <div className="w-6 h-6 flex items-center justify-center bg-gray-200 dark:bg-gray-700 rounded text-xs font-bold">
                      {getShapeIcon(shape.type)}
                    </div>

                    {/* Shape Name */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {shape.type.charAt(0).toUpperCase() + shape.type.slice(1)} {shapes.length - index}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => handleToggleVisibility(shape, e)}
                        className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                        title={isHidden ? 'Show' : 'Hide'}
                      >
                        {isHidden ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={(e) => handleToggleLock(shape, e)}
                        className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                        title={isLocked ? 'Unlock' : 'Lock'}
                      >
                        {isLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={(e) => handleDeleteShape(shape.id, e)}
                        className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded text-red-600"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-2 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
          <p className="text-xs text-gray-500 text-center">
            {shapes.length} layer{shapes.length !== 1 ? 's' : ''}
            {selectedIds.length > 0 && ` · ${selectedIds.length} selected`}
          </p>
        </div>
      </div>
    </Draggable>
  )
})
