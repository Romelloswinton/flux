"use client"

import { useState, useEffect } from "react"
import {
  Eye,
  EyeOff,
  Lock,
  Unlock,
  ChevronDown,
  ChevronRight,
  Layers as LayersIcon,
  Image as ImageIcon,
  Type,
  Folder,
  Sliders,
  CircleDot,
  MoreVertical,
  Copy,
  Scissors,
  Clipboard,
  ClipboardCopy,
  ClipboardPaste,
  Group,
  CircleDashed,
  Merge,
  Pen,
  ArrowUpToLine,
  ArrowDownToLine,
} from "lucide-react"
import type { Layer } from "@/lib/types/layers"

interface LayerItemProps {
  layer: Layer
  depth?: number
  isSelected: boolean
  selectedLayerId?: string | null
  selectedLayerIds?: string[]
  onSelect: (id: string, event?: React.MouseEvent) => void
  onToggleVisibility: (id: string) => void
  onToggleLock: (id: string) => void
  onToggleExpand?: (id: string) => void
  isExpanded?: boolean
  onContextMenuAction?: (action: string, layerId: string) => void
}

export const LayerItem = ({
  layer,
  depth = 0,
  isSelected,
  selectedLayerId = null,
  selectedLayerIds = [],
  onSelect,
  onToggleVisibility,
  onToggleLock,
  onToggleExpand,
  isExpanded = true,
  onContextMenuAction,
}: LayerItemProps) => {
  const [showContextMenu, setShowContextMenu] = useState(false)

  const hasChildren = layer.children && layer.children.length > 0

  // Close context menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setShowContextMenu(false)
    if (showContextMenu) {
      document.addEventListener("click", handleClickOutside)
      return () => document.removeEventListener("click", handleClickOutside)
    }
  }, [showContextMenu])

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setShowContextMenu(true)
  }

  const handleMenuAction = (action: string) => {
    setShowContextMenu(false)
    onContextMenuAction?.(action, layer.id)
  }

  const getLayerIcon = () => {
    switch (layer.type) {
      case "group":
        return <Folder className="h-4 w-4" />
      case "text":
        return <Type className="h-4 w-4" />
      case "image":
        return <ImageIcon className="h-4 w-4" />
      case "adjustment":
        return <Sliders className="h-4 w-4 text-info" />
      case "mask":
        return <CircleDot className="h-4 w-4 text-text-secondary" />
      default:
        return <LayersIcon className="h-4 w-4" />
    }
  }

  const isStackingContext =
    layer.type === "group" || layer.type === "adjustment"

  return (
    <div>
      {/* Layer Row */}
      <div
        className={`flex items-center gap-2 px-2 py-2 mx-1 my-0.5 rounded-lg hover:bg-card-hover transition-colors cursor-pointer group relative ${
          isSelected ? "bg-primary/10 border-l-4 border-l-primary" : ""
        }`}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
        onClick={(e) => onSelect(layer.id, e)}
        onContextMenu={handleContextMenu}
      >
        {/* Stacking Context Indicator */}
        {isStackingContext && depth > 0 && (
          <div
            className="absolute left-0 top-0 bottom-0 w-0.5 bg-primary/20"
            style={{ left: `${(depth - 1) * 16 + 8}px` }}
          />
        )}

        {/* Nesting Lines */}
        {depth > 0 && (
          <div className="absolute left-0 top-0 bottom-0 flex">
            {Array.from({ length: depth }).map((_, i) => (
              <div
                key={i}
                className="w-4 border-l border-border-primary/30"
                style={{ marginLeft: i === 0 ? "8px" : "16px" }}
              />
            ))}
          </div>
        )}
        {/* Expand/Collapse for groups */}
        {hasChildren && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onToggleExpand?.(layer.id)
            }}
            className="p-1 hover:bg-card rounded-md transition-colors"
          >
            {isExpanded ? (
              <ChevronDown className="h-3.5 w-3.5 text-text-secondary" />
            ) : (
              <ChevronRight className="h-3.5 w-3.5 text-text-secondary" />
            )}
          </button>
        )}

        {!hasChildren && <div className="w-4" />}

        {/* Thumbnail/Icon */}
        <div className="h-8 w-8 rounded-lg bg-card-hover flex items-center justify-center text-text-secondary flex-shrink-0">
          {layer.thumbnail ? (
            <img
              src={layer.thumbnail}
              alt={layer.name}
              className="h-full w-full object-cover rounded-lg"
            />
          ) : (
            getLayerIcon()
          )}
        </div>

        {/* Layer Name */}
        <span
          className={`text-sm flex-1 truncate ${
            layer.locked ? "text-text-muted" : ""
          }`}
        >
          {layer.name}
        </span>

        {/* Mask Indicator */}
        {layer.hasMask && (
          <div className="h-4 w-4 rounded-full border-2 border-border-primary bg-card flex items-center justify-center">
            <div className="h-2 w-2 rounded-full bg-text-secondary" />
          </div>
        )}

        {/* Controls - Show on hover or when selected */}
        <div
          className={`flex items-center gap-1 ${
            isSelected || "opacity-0 group-hover:opacity-100"
          }`}
        >
          {/* Visibility Toggle */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              onToggleVisibility(layer.id)
            }}
            className="p-1.5 hover:bg-card rounded-lg transition-colors"
            title={layer.visible ? "Hide layer" : "Show layer"}
          >
            {layer.visible ? (
              <Eye className="h-3.5 w-3.5 text-text-secondary" />
            ) : (
              <EyeOff className="h-3.5 w-3.5 text-text-muted" />
            )}
          </button>

          {/* Lock Toggle */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              onToggleLock(layer.id)
            }}
            className="p-1.5 hover:bg-card rounded-lg transition-colors"
            title={layer.locked ? "Unlock layer" : "Lock layer"}
          >
            {layer.locked ? (
              <Lock className="h-3.5 w-3.5 text-warning" />
            ) : (
              <Unlock className="h-3.5 w-3.5 text-text-secondary" />
            )}
          </button>

          {/* More Options */}
          <button
            onClick={(e) => e.stopPropagation()}
            className="p-1.5 hover:bg-card rounded-lg transition-colors"
            title="More options"
          >
            <MoreVertical className="h-3.5 w-3.5 text-text-secondary" />
          </button>
        </div>
      </div>

      {/* Children Layers (if expanded) */}
      {hasChildren && isExpanded && (
        <div>
          {layer.children?.map((child) => (
            <LayerItem
              key={child.id}
              layer={child}
              depth={depth + 1}
              isSelected={selectedLayerId === child.id || selectedLayerIds.includes(child.id)}
              selectedLayerId={selectedLayerId}
              selectedLayerIds={selectedLayerIds}
              onSelect={onSelect}
              onToggleVisibility={onToggleVisibility}
              onToggleLock={onToggleLock}
              onToggleExpand={onToggleExpand}
              onContextMenuAction={onContextMenuAction}
            />
          ))}
        </div>
      )}

      {/* Context Menu */}
      {showContextMenu && (
        <div
          className="absolute top-52 right-12 left-40 mb-2 bg-card border border-border-primary rounded-lg shadow-2xl py-1 z-50 min-w-48"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => handleMenuAction("copy")}
            className="w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-accent transition-colors text-left"
          >
            <Copy className="h-4 w-4" />
            Copy
          </button>
          <button
            onClick={() => handleMenuAction("cut")}
            className="w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-accent transition-colors text-left"
          >
            <Scissors className="h-4 w-4" />
            Cut
          </button>
          <button
            onClick={() => handleMenuAction("duplicate")}
            className="w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-accent transition-colors text-left"
          >
            <ClipboardCopy className="h-4 w-4" />
            Duplicate
          </button>
          <button
            onClick={() => handleMenuAction("paste")}
            className="w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-accent transition-colors text-left"
          >
            <Clipboard className="h-4 w-4" />
            Paste
          </button>

          <div className="h-px bg-border-primary my-1" />

          <button
            onClick={() => handleMenuAction("copy-properties")}
            className="w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-accent transition-colors text-left"
          >
            <ClipboardCopy className="h-4 w-4" />
            Copy Properties
          </button>
          <button
            onClick={() => handleMenuAction("paste-properties")}
            className="w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-accent transition-colors text-left"
          >
            <ClipboardPaste className="h-4 w-4" />
            Paste Properties
          </button>

          <div className="h-px bg-border-primary my-1" />

          <button
            onClick={() => handleMenuAction("group-selection")}
            className="w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-accent transition-colors text-left"
          >
            <Group className="h-4 w-4" />
            Group Selection
          </button>
          {layer.type === 'group' && (
            <button
              onClick={() => handleMenuAction("ungroup")}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-accent transition-colors text-left"
            >
              <Group className="h-4 w-4" />
              Ungroup
            </button>
          )}
          <button
            onClick={() => handleMenuAction("use-as-mask")}
            className="w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-accent transition-colors text-left"
          >
            <CircleDashed className="h-4 w-4" />
            Use as Mask
          </button>

          <div className="h-px bg-border-primary my-1" />

          <button
            onClick={() => handleMenuAction("flatten")}
            className="w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-accent transition-colors text-left"
          >
            <Merge className="h-4 w-4" />
            Flatten
          </button>
          <button
            onClick={() => handleMenuAction("outline-stroke")}
            className="w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-accent transition-colors text-left"
          >
            <Pen className="h-4 w-4" />
            Outline Stroke
          </button>

          <div className="h-px bg-border-primary my-1" />

          <button
            onClick={() => handleMenuAction("bring-to-front")}
            className="w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-accent transition-colors text-left"
          >
            <ArrowUpToLine className="h-4 w-4" />
            Bring to Front
          </button>
          <button
            onClick={() => handleMenuAction("send-to-back")}
            className="w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-accent transition-colors text-left"
          >
            <ArrowDownToLine className="h-4 w-4" />
            Send to Back
          </button>
        </div>
      )}
    </div>
  )
}
