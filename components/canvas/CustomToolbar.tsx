"use client"

import { useEditor, track } from 'tldraw'
import { MousePointer2, Square, Circle, ArrowRight, Type, Pencil, Hand, Eraser } from 'lucide-react'

export const CustomToolbar = track(() => {
  const editor = useEditor()
  const currentTool = editor.getCurrentToolId()

  const tools = [
    { id: 'select', icon: MousePointer2, label: 'Select (V)' },
    { id: 'hand', icon: Hand, label: 'Hand (H)' },
    { id: 'draw', icon: Pencil, label: 'Draw (D)' },
    { id: 'eraser', icon: Eraser, label: 'Eraser (E)' },
    { id: 'rectangle', icon: Square, label: 'Rectangle (R)' },
    { id: 'ellipse', icon: Circle, label: 'Circle (O)' },
    { id: 'arrow', icon: ArrowRight, label: 'Arrow (A)' },
    { id: 'text', icon: Type, label: 'Text (T)' },
  ]

  const handleToolChange = (toolId: string) => {
    editor.setCurrentTool(toolId)
  }

  return (
    <div className="fixed left-1/2 transform -translate-x-1/2 bottom-8 bg-white dark:bg-gray-900 rounded-full shadow-2xl border-2 border-purple-500 px-3 py-2 z-50 flex items-center gap-1"
         style={{ pointerEvents: 'all' }}>
      {tools.map((tool) => {
        const Icon = tool.icon
        const isActive = currentTool === tool.id

        return (
          <button
            key={tool.id}
            onClick={() => handleToolChange(tool.id)}
            className={`p-3 rounded-full transition-all duration-200 ${
              isActive
                ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-lg scale-110'
                : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
            }`}
            title={tool.label}
          >
            <Icon className="w-5 h-5" />
          </button>
        )
      })}
    </div>
  )
})
