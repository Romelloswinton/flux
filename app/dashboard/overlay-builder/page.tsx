"use client"

import { useState, useEffect, useRef } from "react"
import dynamic from "next/dynamic"
import { GlobalToolsBar } from "@/components/canvas/GlobalToolsBar"
import { PropertiesPanel } from "@/components/canvas/PropertiesPanel"
import { LeftPanel } from "@/components/panels/LeftPanel"
import { ExportModal } from "@/components/canvas/ExportModal"
import type { ToolType, SaveStatus, Shape, ShapeType } from "@/lib/types/canvas"
import type { Layer, Asset, AssetCategory } from "@/lib/types/layers"

// Dynamically import CanvasWorkspace to prevent SSR and multiple Konva instances
const CanvasWorkspace = dynamic(
  () =>
    import("@/components/canvas/CanvasWorkspace").then(
      (mod) => mod.CanvasWorkspace
    ),
  {
    ssr: false,
    loading: () => (
      <div className="flex-1 flex items-center justify-center bg-background">
        <div className="text-text-secondary text-sm">Loading canvas...</div>
      </div>
    ),
  }
)

export default function OverlayBuilder() {
  // Canvas State
  const [shapes, setShapes] = useState<Shape[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)

  // Layers State
  const [layers, setLayers] = useState<Layer[]>([
    {
      id: "layer-1",
      name: "Background",
      type: "shape",
      visible: true,
      locked: false,
      opacity: 100,
      blendMode: "normal",
    },
  ])
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(
    "layer-1"
  )
  const [selectedLayerIds, setSelectedLayerIds] = useState<string[]>([])

  // Assets State
  const [assets, setAssets] = useState<Asset[]>([])
  const [assetCategories] = useState<AssetCategory[]>([
    { id: "overlays", name: "Overlays" },
    { id: "badges", name: "Badges" },
    { id: "widgets", name: "Widgets" },
    { id: "templates", name: "Templates" },
  ])

  // Tools State
  const [activeTool, setActiveTool] = useState<ToolType>("select")

  // Project State
  const [projectName, setProjectName] = useState("Untitled Overlay")
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("saved")
  const [zoom, setZoom] = useState(100)

  // Collaboration State
  const [isLocked, setIsLocked] = useState(false)
  const collaborators = [
    { id: 1, name: "You", avatar: "Y", color: "#9146ff" },
    { id: 2, name: "Alex", avatar: "A", color: "#00f593" },
    { id: 3, name: "Sam", avatar: "S", color: "#00c8ff" },
  ]

  // Auto-save timer ref
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Clipboard for copy/paste
  const [clipboard, setClipboard] = useState<{ shape: Shape; layer: Layer } | null>(null)

  // Export modal state
  const [isExportModalOpen, setIsExportModalOpen] = useState(false)

  // Shape Management
  const addShape = (type: ShapeType) => {
    const shapeId = `${type}-${Date.now()}`
    const newShape: Shape = {
      id: shapeId,
      type,
      x: 100,
      y: 100,
      fill:
        type === "rect" ? "#9146ff" :
        type === "circle" ? "#00f593" :
        type === "diamond" ? "#ff6b6b" :
        type === "polygon" ? "#4ecdc4" :
        "#ffffff",
    }

    if (type === "rect") {
      newShape.width = 150
      newShape.height = 100
    } else if (type === "diamond") {
      newShape.width = 100
      newShape.height = 100
    } else if (type === "polygon") {
      // Pentagon shape - 5 points
      newShape.width = 100
      newShape.height = 100
      newShape.points = [0, -50, 47.5, -15.5, 29.4, 40.5, -29.4, 40.5, -47.5, -15.5]
    } else if (type === "circle") {
      newShape.radius = 50
    } else if (type === "text") {
      newShape.text = "Your Text"
      newShape.width = 200
    }

    // Create corresponding layer
    const newLayer: Layer = {
      id: shapeId,
      name: `${type.charAt(0).toUpperCase() + type.slice(1)} ${
        shapes.length + 1
      }`,
      type: type === "text" ? "text" : "shape",
      visible: true,
      locked: false,
      opacity: 100,
      blendMode: "normal",
      x: 100,
      y: 100,
    }

    setShapes([...shapes, newShape])
    setLayers([...layers, newLayer])
    setSelectedLayerId(shapeId)
    setSelectedId(shapeId)
    setSaveStatus("unsaved")
    setActiveTool("select")
  }

  const handleToolChange = (tool: ToolType) => {
    setActiveTool(tool)
    // Don't auto-create shape anymore - let user click on canvas to place it
  }

  const handleCanvasClick = (x: number, y: number) => {
    // Only create shape if a creation tool is active (not select)
    if (activeTool === "rect" || activeTool === "diamond" || activeTool === "polygon" || activeTool === "circle" || activeTool === "text") {
      const shapeId = `${activeTool}-${Date.now()}`
      const newShape: Shape = {
        id: shapeId,
        type: activeTool as ShapeType,
        x: x,
        y: y,
        fill:
          activeTool === "rect" ? "#9146ff" :
          activeTool === "circle" ? "#00f593" :
          activeTool === "diamond" ? "#ff6b6b" :
          activeTool === "polygon" ? "#4ecdc4" :
          "#ffffff",
      }

      if (activeTool === "rect") {
        newShape.width = 150
        newShape.height = 100
      } else if (activeTool === "diamond") {
        newShape.width = 100
        newShape.height = 100
      } else if (activeTool === "polygon") {
        // Pentagon shape - 5 points
        newShape.width = 100
        newShape.height = 100
        newShape.points = [0, -50, 47.5, -15.5, 29.4, 40.5, -29.4, 40.5, -47.5, -15.5]
      } else if (activeTool === "circle") {
        newShape.radius = 50
      } else if (activeTool === "text") {
        newShape.text = "Your Text"
        newShape.width = 200
      }

      // Create corresponding layer
      const newLayer: Layer = {
        id: shapeId,
        name: `${activeTool.charAt(0).toUpperCase() + activeTool.slice(1)} ${
          shapes.length + 1
        }`,
        type: activeTool === "text" ? "text" : "shape",
        visible: true,
        locked: false,
        opacity: 100,
        blendMode: "normal",
        x: x,
        y: y,
      }

      setShapes([...shapes, newShape])
      setLayers([...layers, newLayer])
      setSelectedLayerId(shapeId)
      setSelectedId(shapeId)
      setSaveStatus("unsaved")
      setActiveTool("select") // Switch back to select tool after placing
    }
  }

  const handleShapeDragEnd = (id: string, x: number, y: number) => {
    // Update both shape and layer positions
    setShapes(
      shapes.map((shape) => (shape.id === id ? { ...shape, x, y } : shape))
    )
    setLayers(
      layers.map((layer) => (layer.id === id ? { ...layer, x, y } : layer))
    )
    setSaveStatus("unsaved")
  }

  const handleShapeUpdate = (id: string, updates: Partial<Shape>) => {
    setShapes(
      shapes.map((shape) =>
        shape.id === id ? { ...shape, ...updates } : shape
      )
    )
    setSaveStatus("unsaved")
  }

  const handleShapeDelete = (id: string) => {
    // Delete both shape and layer
    setShapes(shapes.filter((shape) => shape.id !== id))
    setLayers(layers.filter((layer) => layer.id !== id))
    setSelectedId(null)
    setSelectedLayerId(null)
    setSaveStatus("unsaved")
  }

  // Project Management
  const handleSave = () => {
    setSaveStatus("saving")
    setTimeout(() => {
      setSaveStatus("saved")
    }, 1000)
  }

  const handleExport = (format: string, options: any) => {
    console.log("Exporting as:", format, "with options:", options)
  }

  // Layer Management
  const handleLayerAdd = (
    type: "shape" | "text" | "group" | "adjustment" | "mask"
  ) => {
    // For shape/text layers, create actual canvas shape
    if (type === "shape" || type === "text") {
      const shapeType: ShapeType = type === "text" ? "text" : "rect"
      addShape(shapeType)
      return
    }

    // For special layer types (group, adjustment, mask)
    const newLayer: Layer = {
      id: `layer-${Date.now()}`,
      name: `${type.charAt(0).toUpperCase() + type.slice(1)} Layer`,
      type,
      visible: true,
      locked: false,
      opacity: 100,
      blendMode: "normal",
      hasMask: type === "mask",
      children: type === "group" ? [] : undefined,
    }
    setLayers([...layers, newLayer])
    setSelectedLayerId(newLayer.id)
  }

  const handleLayerDelete = (id: string) => {
    // Delete both layer and corresponding shape
    setLayers(layers.filter((l) => l.id !== id))
    setShapes(shapes.filter((s) => s.id !== id))
    if (selectedLayerId === id) {
      setSelectedLayerId(null)
      setSelectedId(null)
    }
  }

  const handleLayerDuplicate = (id: string) => {
    const layer = layers.find((l) => l.id === id)
    if (layer) {
      const duplicate: Layer = {
        ...layer,
        id: `layer-${Date.now()}`,
        name: `${layer.name} Copy`,
      }
      setLayers([...layers, duplicate])
    }
  }

  const handleLayerUpdate = (id: string, updates: Partial<Layer>) => {
    setLayers(layers.map((l) => (l.id === id ? { ...l, ...updates } : l)))
  }

  // Asset Management
  const handleAssetSelect = (asset: Asset) => {
    console.log("Selected asset:", asset)
    // TODO: Add asset to canvas
  }

  const handleAssetCreate = () => {
    console.log("Create new asset")
    // TODO: Open asset creation modal
  }

  const handleLayerContextMenu = (action: string, layerId: string) => {
    console.log("Context menu action:", action, "for layer:", layerId)

    switch (action) {
      case 'copy':
        // Use existing copy logic
        const shape = shapes.find(s => s.id === layerId)
        const layer = layers.find(l => l.id === layerId)
        if (shape && layer) {
          setClipboard({ shape, layer })
        }
        break
      case 'cut':
        // Copy then delete
        const cutShape = shapes.find(s => s.id === layerId)
        const cutLayer = layers.find(l => l.id === layerId)
        if (cutShape && cutLayer) {
          setClipboard({ shape: cutShape, layer: cutLayer })
          handleLayerDelete(layerId)
        }
        break
      case 'duplicate':
        handleLayerDuplicate(layerId)
        break
      case 'paste':
        // Paste logic (will be implemented)
        if (clipboard) {
          const shapeId = `${clipboard.shape.type}-${Date.now()}`
          const newShape: Shape = {
            ...clipboard.shape,
            id: shapeId,
            x: clipboard.shape.x + 20,
            y: clipboard.shape.y + 20,
          }
          const newLayer: Layer = {
            ...clipboard.layer,
            id: shapeId,
            name: `${clipboard.layer.name} Copy`,
            x: clipboard.layer.x ? clipboard.layer.x + 20 : undefined,
            y: clipboard.layer.y ? clipboard.layer.y + 20 : undefined,
          }
          setShapes([...shapes, newShape])
          setLayers([...layers, newLayer])
          setSelectedLayerId(shapeId)
          setSelectedId(shapeId)
          setSaveStatus("unsaved")
        }
        break
      case 'bring-to-front':
        // Move layer to end of array (top)
        const layerToFront = layers.find(l => l.id === layerId)
        if (layerToFront) {
          setLayers([...layers.filter(l => l.id !== layerId), layerToFront])
          setSaveStatus("unsaved")
        }
        break
      case 'send-to-back':
        // Move layer to start of array (bottom)
        const layerToBack = layers.find(l => l.id === layerId)
        if (layerToBack) {
          setLayers([layerToBack, ...layers.filter(l => l.id !== layerId)])
          setSaveStatus("unsaved")
        }
        break
      case 'use-as-mask':
        // Find the current layer and the layer below it
        const currentLayerIndex = layers.findIndex(l => l.id === layerId)
        if (currentLayerIndex !== -1) {
          // Get the layer below (previous in array)
          const targetLayerIndex = currentLayerIndex - 1

          if (targetLayerIndex >= 0) {
            const targetLayer = layers[targetLayerIndex]

            // Update layers: mark current as mask, target as having mask
            const updatedLayers = layers.map((l, idx) => {
              if (idx === currentLayerIndex) {
                // Mark this layer as a mask
                return {
                  ...l,
                  isMask: true,
                  maskTargetId: targetLayer.id,
                  visible: true // Keep mask visible for editing
                }
              } else if (idx === targetLayerIndex) {
                // Mark target layer as having a mask
                return { ...l, hasMask: true }
              }
              return l
            })

            setLayers(updatedLayers)
            setSaveStatus("unsaved")
            console.log(`Layer "${layers[currentLayerIndex].name}" is now masking "${targetLayer.name}"`)
          } else {
            console.log("No layer below to mask")
          }
        }
        break
      case 'group-selection':
        // Group selected layers
        if (selectedLayerIds.length > 1) {
          // Create a new group layer
          const groupId = `group-${Date.now()}`
          const groupName = `Group ${layers.filter(l => l.type === 'group').length + 1}`

          // Get the selected layers and their shapes
          const layersToGroup = layers.filter(l => selectedLayerIds.includes(l.id))
          const shapesToGroup = shapes.filter(s => selectedLayerIds.includes(s.id))

          // Create the group layer with children
          const groupLayer: Layer = {
            id: groupId,
            name: groupName,
            type: 'group',
            visible: true,
            locked: false,
            opacity: 100,
            blendMode: 'normal',
            children: layersToGroup,
          }

          // Remove grouped layers from top level and add the group
          const remainingLayers = layers.filter(l => !selectedLayerIds.includes(l.id))
          setLayers([...remainingLayers, groupLayer])

          // Clear multi-selection and select the new group
          setSelectedLayerIds([])
          setSelectedLayerId(groupId)
          setSaveStatus("unsaved")

          console.log(`Created group "${groupName}" with ${layersToGroup.length} layers`)
        } else if (selectedLayerIds.length === 1) {
          console.log("Need at least 2 layers to create a group. Select multiple layers with Ctrl/Cmd+click.")
        } else {
          console.log("No layers selected for grouping")
        }
        break
      case 'ungroup':
        // Ungroup a group layer - move children back to top level
        const groupLayer = layers.find(l => l.id === layerId)
        if (groupLayer && groupLayer.type === 'group' && groupLayer.children) {
          // Get all layers except the group
          const otherLayers = layers.filter(l => l.id !== layerId)

          // Add the group's children to the layers array
          const updatedLayers = [...otherLayers, ...groupLayer.children]
          setLayers(updatedLayers)

          // Clear selection
          setSelectedLayerId(null)
          setSaveStatus("unsaved")

          console.log(`Ungrouped "${groupLayer.name}" - moved ${groupLayer.children.length} layers to top level`)
        } else {
          console.log("Selected layer is not a group or has no children")
        }
        break
      case 'unmask':
        // Remove mask from a layer
        const updatedLayers = layers.map(l => {
          if (l.id === layerId) {
            // If this layer has a mask, remove it
            if (l.hasMask) {
              const { hasMask, ...rest } = l;
              return rest;
            }
            // If this layer IS a mask, remove the mask properties
            if (l.isMask) {
              const { isMask, maskTargetId, ...rest } = l;
              return rest;
            }
          }
          // Also check if this layer is being masked by the clicked layer
          if (l.isMask && l.maskTargetId === layerId) {
            const { isMask, maskTargetId, ...rest } = l;
            return rest;
          }
          return l;
        });
        setLayers(updatedLayers);
        setSaveStatus("unsaved");
        console.log(`Removed mask from layer "${layers.find(l => l.id === layerId)?.name}"`);
        break
      default:
        console.log("Action not implemented yet:", action)
    }
  }

  const selectedShape = shapes.find((s) => s.id === selectedId) || null
  const selectedLayer = layers.find((l) => l.id === selectedLayerId) || null

  // Auto-populate canvas with a centered square on initial load
  useEffect(() => {
    if (shapes.length === 0) {
      const canvasWidth = window.innerWidth
      const canvasHeight = window.innerHeight
      const rectWidth = 150
      const rectHeight = 100

      const shapeId = `rect-${Date.now()}`
      const newShape: Shape = {
        id: shapeId,
        type: "rect",
        x: (canvasWidth / 2) - (rectWidth / 2), // Center X
        y: (canvasHeight / 2) - (rectHeight / 2), // Center Y
        fill: "#9146ff",
        width: rectWidth,
        height: rectHeight,
      }

      const newLayer: Layer = {
        id: shapeId,
        name: "Rectangle 1",
        type: "shape",
        visible: true,
        locked: false,
        opacity: 100,
        blendMode: "normal",
        x: (canvasWidth / 2) - (rectWidth / 2),
        y: (canvasHeight / 2) - (rectHeight / 2),
      }

      setShapes([newShape])
      setLayers([...layers, newLayer])
      setSelectedLayerId(shapeId)
      setSelectedId(shapeId)
      setSaveStatus("unsaved")
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input field
      const target = e.target as HTMLElement
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        return
      }

      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0
      const cmdOrCtrl = isMac ? e.metaKey : e.ctrlKey

      // Copy: Cmd/Ctrl + C
      if (cmdOrCtrl && e.key === 'c' && selectedId) {
        e.preventDefault()
        const shape = shapes.find(s => s.id === selectedId)
        const layer = layers.find(l => l.id === selectedId)
        if (shape && layer) {
          setClipboard({ shape, layer })
        }
      }

      // Paste: Cmd/Ctrl + V
      if (cmdOrCtrl && e.key === 'v' && clipboard) {
        e.preventDefault()
        const shapeId = `${clipboard.shape.type}-${Date.now()}`
        const newShape: Shape = {
          ...clipboard.shape,
          id: shapeId,
          x: clipboard.shape.x + 20, // Offset to make it visible
          y: clipboard.shape.y + 20,
        }

        const newLayer: Layer = {
          ...clipboard.layer,
          id: shapeId,
          name: `${clipboard.layer.name} Copy`,
          x: clipboard.layer.x ? clipboard.layer.x + 20 : undefined,
          y: clipboard.layer.y ? clipboard.layer.y + 20 : undefined,
        }

        setShapes([...shapes, newShape])
        setLayers([...layers, newLayer])
        setSelectedLayerId(shapeId)
        setSelectedId(shapeId)
        setSaveStatus("unsaved")
      }

      // Duplicate: Cmd/Ctrl + D
      if (cmdOrCtrl && e.key === 'd' && selectedId) {
        e.preventDefault()
        const shape = shapes.find(s => s.id === selectedId)
        const layer = layers.find(l => l.id === selectedId)
        if (shape && layer) {
          const shapeId = `${shape.type}-${Date.now()}`
          const newShape: Shape = {
            ...shape,
            id: shapeId,
            x: shape.x + 20,
            y: shape.y + 20,
          }

          const newLayer: Layer = {
            ...layer,
            id: shapeId,
            name: `${layer.name} Copy`,
            x: layer.x ? layer.x + 20 : undefined,
            y: layer.y ? layer.y + 20 : undefined,
          }

          setShapes([...shapes, newShape])
          setLayers([...layers, newLayer])
          setSelectedLayerId(shapeId)
          setSelectedId(shapeId)
          setSaveStatus("unsaved")
        }
      }

      // Delete: Delete or Backspace
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedId) {
        e.preventDefault()
        handleShapeDelete(selectedId)
      }

      // Select All: Cmd/Ctrl + A
      if (cmdOrCtrl && e.key === 'a') {
        e.preventDefault()
        // Select the first shape if any exist
        if (shapes.length > 0) {
          setSelectedId(shapes[0].id)
          setSelectedLayerId(shapes[0].id)
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [shapes, layers, selectedId, clipboard]) // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-save effect: saves 3 seconds after last change
  useEffect(() => {
    // Only auto-save when there are unsaved changes
    if (saveStatus === "unsaved") {
      // Clear any existing timer
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current)
      }

      // Set a new timer for 3 seconds
      autoSaveTimerRef.current = setTimeout(() => {
        handleSave()
      }, 3000)
    }

    // Cleanup timer on unmount or when dependencies change
    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current)
      }
    }
  }, [shapes, layers, saveStatus]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="min-h-screen flex flex-col bg-background relative">
      {/* Floating Global Tools Bar */}
      <GlobalToolsBar
        activeTool={activeTool}
        onToolChange={handleToolChange}
        projectName={projectName}
        saveStatus={saveStatus}
        onProjectNameChange={setProjectName}
        onSave={handleSave}
        zoom={zoom}
        onZoomChange={setZoom}
        collaborators={collaborators}
        isLocked={isLocked}
        onLockToggle={() => setIsLocked(!isLocked)}
      />

      {/* Main Workspace */}
      <div className="flex-1 flex overflow-y-auto pt-20 relative">
        {/* Canvas (full width) */}
        <CanvasWorkspace
          shapes={shapes}
          selectedId={selectedId}
          selectedLayerIds={selectedLayerIds}
          activeTool={activeTool}
          onShapeSelect={(id) => {
            setSelectedId(id)
            setSelectedLayerId(id)
            setSelectedLayerIds([]) // Clear multi-selection when clicking a shape on canvas
          }}
          onShapeDragEnd={handleShapeDragEnd}
          onShapeUpdate={handleShapeUpdate}
          onCanvasClick={handleCanvasClick}
          zoom={zoom}
          layers={layers}
        />

        {/* Floating Left Panel - Layers & Assets */}
        <div className="absolute left-0 top-24 bottom-4 pointer-events-none z-20">
          <div className="pointer-events-auto">
            <LeftPanel
              layers={layers}
              selectedLayerId={selectedLayerId}
              selectedLayerIds={selectedLayerIds}
              onLayerSelect={(id, event) => {
                // Check for Ctrl/Cmd key for multi-selection
                const isMultiSelect = event?.ctrlKey || event?.metaKey

                if (isMultiSelect) {
                  // Toggle layer in multi-selection
                  if (selectedLayerIds.includes(id)) {
                    const newSelectedIds = selectedLayerIds.filter(lid => lid !== id)
                    setSelectedLayerIds(newSelectedIds)
                    // Update primary selection to last remaining item, or clear if none
                    if (newSelectedIds.length > 0) {
                      const lastId = newSelectedIds[newSelectedIds.length - 1]
                      setSelectedLayerId(lastId)
                      setSelectedId(lastId)
                    } else {
                      setSelectedLayerId(null)
                      setSelectedId(null)
                    }
                  } else {
                    // Add to multi-selection and set as primary selection
                    setSelectedLayerIds([...selectedLayerIds, id])
                    setSelectedLayerId(id)
                    setSelectedId(id)
                  }
                } else {
                  // Single selection - clear multi-select
                  setSelectedLayerId(id)
                  setSelectedId(id) // Sync canvas selection
                  setSelectedLayerIds([]) // Clear multi-selection
                }
              }}
              onLayerAdd={handleLayerAdd}
              onLayerDelete={handleLayerDelete}
              onLayerUpdate={handleLayerUpdate}
              onContextMenuAction={handleLayerContextMenu}
              assets={assets}
              assetCategories={assetCategories}
              onAssetSelect={handleAssetSelect}
              onAssetCreate={handleAssetCreate}
            />
          </div>
        </div>

        {/* Floating Right Panel - Properties */}
        <div className="absolute right-0 top-24 bottom-4 pointer-events-none z-20">
          <div className="pointer-events-auto">
            <PropertiesPanel
              activeTool={activeTool}
              selectedShape={selectedShape}
              selectedLayer={selectedLayer}
              onShapeUpdate={handleShapeUpdate}
              onLayerUpdate={handleLayerUpdate}
              onShapeDelete={handleShapeDelete}
              onExportClick={() => setIsExportModalOpen(true)}
            />
          </div>
        </div>
      </div>

      {/* Export Modal - Rendered at page level for proper centering */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        onExport={handleExport}
      />
    </div>
  )
}
