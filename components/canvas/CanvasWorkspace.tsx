'use client';

import { useState, useEffect, useRef } from 'react';
import { Stage, Layer, Rect, Circle, Text as KonvaText, Transformer, Group, Line } from 'react-konva';
import { Palette } from 'lucide-react';
import { SelectionIndicator } from './SelectionIndicator';
import type { Shape } from '@/lib/types/canvas';
import type { Layer as LayerType, BlendMode } from '@/lib/types/layers';
import type Konva from 'konva';

// Map blend modes to Konva's globalCompositeOperation
const getCompositeOperation = (blendMode: BlendMode): GlobalCompositeOperation => {
  const blendModeMap: Record<BlendMode, GlobalCompositeOperation> = {
    'normal': 'source-over',
    'multiply': 'multiply',
    'screen': 'screen',
    'overlay': 'overlay',
    'darken': 'darken',
    'lighten': 'lighten',
    'color-dodge': 'color-dodge',
    'color-burn': 'color-burn',
    'hard-light': 'hard-light',
    'soft-light': 'soft-light',
    'difference': 'difference',
    'exclusion': 'exclusion',
  };
  return blendModeMap[blendMode] || 'source-over';
};

interface CanvasWorkspaceProps {
  shapes: Shape[];
  selectedId: string | null;
  selectedLayerIds?: string[];
  activeTool: string;
  onShapeSelect: (id: string | null) => void;
  onShapeDragEnd: (id: string, x: number, y: number) => void;
  onShapeUpdate?: (id: string, updates: Partial<Shape>) => void;
  onCanvasClick: (x: number, y: number) => void;
  zoom: number;
  layers: LayerType[];
}

type SelectionMode = 'default' | 'drill-down' | 'isolated';

export const CanvasWorkspace = ({
  shapes,
  selectedId,
  selectedLayerIds = [],
  activeTool,
  onShapeSelect,
  onShapeDragEnd,
  onShapeUpdate,
  onCanvasClick,
  zoom,
  layers,
}: CanvasWorkspaceProps) => {
  const [canvasWidth, setCanvasWidth] = useState(window.innerWidth);
  const [canvasHeight, setCanvasHeight] = useState(window.innerHeight);

  // Update canvas size on window resize
  useEffect(() => {
    const handleResize = () => {
      setCanvasWidth(window.innerWidth);
      setCanvasHeight(window.innerHeight);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Helper to find layer for a shape
  const findLayerById = (id: string): LayerType | null => {
    const findInLayers = (layerList: LayerType[]): LayerType | null => {
      for (const layer of layerList) {
        if (layer.id === id) return layer;
        if (layer.children) {
          const found = findInLayers(layer.children);
          if (found) return found;
        }
      }
      return null;
    };
    return findInLayers(layers);
  };

  // Helper to find mask shape for a layer
  const findMaskForLayer = (layerId: string): Shape | null => {
    const layer = findLayerById(layerId);
    if (!layer || !layer.hasMask) return null;

    // Find the layer that is masking this layer
    const maskLayer = layers.find(l => l.isMask && l.maskTargetId === layerId);
    if (!maskLayer) return null;

    // Find the shape for the mask layer
    return shapes.find(s => s.id === maskLayer.id) || null;
  };

  const [selectionMode, setSelectionMode] = useState<SelectionMode>('default');
  const [clickCount, setClickCount] = useState(0);
  const [lastClickTime, setLastClickTime] = useState(0);
  const [modifierKeyPressed, setModifierKeyPressed] = useState(false);

  // Refs for transformer
  const transformerRef = useRef<Konva.Transformer>(null);
  const shapeRefs = useRef<{ [key: string]: Konva.Shape | Konva.Text }>({});

  // Attach transformer to selected shape
  useEffect(() => {
    if (transformerRef.current && selectedId) {
      const selectedNode = shapeRefs.current[selectedId];
      if (selectedNode) {
        transformerRef.current.nodes([selectedNode]);
        transformerRef.current.getLayer()?.batchDraw();
      }
    } else if (transformerRef.current) {
      transformerRef.current.nodes([]);
      transformerRef.current.getLayer()?.batchDraw();
    }
  }, [selectedId]);

  // Track modifier keys (Ctrl/Cmd)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        setModifierKeyPressed(true);
        setSelectionMode('drill-down');
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (!e.ctrlKey && !e.metaKey) {
        setModifierKeyPressed(false);
        setSelectionMode('default');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Handle transform end (resize, rotate, etc.)
  const handleTransformEnd = (id: string) => {
    const node = shapeRefs.current[id];
    if (node && onShapeUpdate) {
      const scaleX = node.scaleX();
      const scaleY = node.scaleY();

      // Reset scale to 1 and apply to width/height instead
      node.scaleX(1);
      node.scaleY(1);

      const shape = shapes.find(s => s.id === id);
      if (shape) {
        if (shape.type === 'rect' || shape.type === 'text') {
          // Update shape dimensions
          onShapeUpdate(id, {
            x: node.x(),
            y: node.y(),
            width: Math.max(5, (shape.width || 0) * scaleX),
            height: shape.type === 'rect' ? Math.max(5, (shape.height || 0) * scaleY) : shape.height,
          });
        } else if (shape.type === 'circle') {
          // For circles, scale the radius
          onShapeUpdate(id, {
            x: node.x(),
            y: node.y(),
            radius: Math.max(5, (shape.radius || 0) * scaleX),
          });
        }
      }
    }
  };

  // Handle click behavior (single vs double click)
  const handleShapeClick = (id: string) => {
    const now = Date.now();
    const timeSinceLastClick = now - lastClickTime;

    // Double-click detection (within 300ms)
    if (timeSinceLastClick < 300) {
      setClickCount(2);
      // TODO: Implement drill-down logic
      console.log('Double-click detected - drill down into:', id);
    } else {
      setClickCount(1);
      // Rule 3.1: Default - select top level (or current shape if modifier pressed)
      if (modifierKeyPressed) {
        console.log('Modifier + click - drill down to:', id);
      } else {
        console.log('Single click - select top level:', id);
      }
      onShapeSelect(id);
    }

    setLastClickTime(now);

    // Reset click count after delay
    setTimeout(() => setClickCount(0), 400);
  };

  return (
    <main className="w-screen h-screen flex flex-col bg-background overflow-hidden">
      {/* Selection Mode Indicator */}
      <div className="absolute top-24 left-8 z-30">
        <SelectionIndicator
          mode={selectionMode}
          hint={
            modifierKeyPressed
              ? 'Click to select nested layers'
              : clickCount === 2
              ? 'Double-click to drill into groups'
              : undefined
          }
        />
      </div>

      <div className="flex-1 flex items-center justify-center overflow-hidden">
        <div className="relative w-full h-full">
        {/* Canvas Container */}
        <div
          className="bg-[#0e0e10] relative w-full h-full"
          style={{
            width: canvasWidth,
            height: canvasHeight,
          }}
        >
          <Stage
            width={canvasWidth}
            height={canvasHeight}
            scaleX={zoom / 100}
            scaleY={zoom / 100}
            onClick={(e) => {
              const clickedOnEmpty = e.target === e.target.getStage();
              if (clickedOnEmpty) {
                // If a creation tool is active, create shape at click position
                if (activeTool !== 'select' && activeTool !== 'hand' && activeTool !== 'zoom') {
                  const stage = e.target.getStage();
                  if (stage) {
                    const pointerPos = stage.getPointerPosition();
                    if (pointerPos) {
                      // Adjust for zoom
                      const x = pointerPos.x / (zoom / 100);
                      const y = pointerPos.y / (zoom / 100);
                      onCanvasClick(x, y);
                    }
                  }
                } else {
                  // Otherwise just deselect
                  onShapeSelect(null);
                }
              }
            }}
          >
            <Layer>
              {shapes.map((shape) => {
                const layer = findLayerById(shape.id);
                const isSelected = shape.id === selectedId || selectedLayerIds.includes(shape.id);

                // Don't render if layer is hidden
                if (layer && !layer.visible) return null;

                // Skip rendering mask layers separately (they'll be used for clipping)
                if (layer?.isMask) return null;

                // Calculate opacity from layer
                const opacity = layer ? layer.opacity / 100 : 1;

                // Check if draggable (not locked)
                const draggable = layer ? !layer.locked : true;

                // Get blend mode from layer
                const blendMode = layer?.blendMode || 'normal';
                const compositeOperation = getCompositeOperation(blendMode);

                // Check if this shape has a mask
                const maskShape = layer?.hasMask ? findMaskForLayer(shape.id) : null;

                const commonProps = {
                  key: shape.id,
                  ref: (node: any) => {
                    if (node) {
                      shapeRefs.current[shape.id] = node;
                    }
                  },
                  x: layer?.x ?? shape.x,
                  y: layer?.y ?? shape.y,
                  draggable,
                  fill: shape.fill,
                  opacity,
                  globalCompositeOperation: compositeOperation,
                  stroke: isSelected ? '#00f593' : undefined,
                  strokeWidth: isSelected ? 2 : 0,
                  onClick: () => handleShapeClick(shape.id),
                  onDragEnd: (e: any) => {
                    onShapeDragEnd(shape.id, e.target.x(), e.target.y());
                  },
                  onTransformEnd: () => handleTransformEnd(shape.id),
                  // Visual feedback for locked layers
                  shadowEnabled: layer?.locked,
                  shadowColor: 'red',
                  shadowBlur: layer?.locked ? 5 : 0,
                  shadowOpacity: layer?.locked ? 0.3 : 0,
                };

                // Render the shape
                let shapeElement;
                if (shape.type === 'rect') {
                  shapeElement = (
                    <Rect
                      {...commonProps}
                      width={shape.width}
                      height={shape.height}
                    />
                  );
                } else if (shape.type === 'diamond') {
                  // Diamond is a rotated square
                  shapeElement = (
                    <Rect
                      {...commonProps}
                      width={shape.width}
                      height={shape.height}
                      offsetX={shape.width ? shape.width / 2 : 0}
                      offsetY={shape.height ? shape.height / 2 : 0}
                      x={(layer?.x ?? shape.x) + (shape.width ? shape.width / 2 : 0)}
                      y={(layer?.y ?? shape.y) + (shape.height ? shape.height / 2 : 0)}
                      rotation={45}
                    />
                  );
                } else if (shape.type === 'polygon') {
                  // Polygon using points
                  shapeElement = (
                    <Line
                      {...commonProps}
                      points={shape.points || []}
                      closed={true}
                    />
                  );
                } else if (shape.type === 'circle') {
                  shapeElement = <Circle {...commonProps} radius={shape.radius} />;
                } else if (shape.type === 'text') {
                  shapeElement = (
                    <KonvaText
                      {...commonProps}
                      text={shape.text}
                      fontSize={24}
                      fontFamily="Arial"
                      width={shape.width}
                    />
                  );
                } else {
                  return null;
                }

                // If shape has a mask, wrap it in a Group with clipping
                if (maskShape) {
                  const maskLayer = findLayerById(maskShape.id);
                  return (
                    <Group
                      key={`masked-${shape.id}`}
                      clipFunc={(ctx) => {
                        ctx.beginPath();
                        const maskX = maskLayer?.x ?? maskShape.x;
                        const maskY = maskLayer?.y ?? maskShape.y;

                        if (maskShape.type === 'rect') {
                          ctx.rect(maskX, maskY, maskShape.width || 0, maskShape.height || 0);
                        } else if (maskShape.type === 'circle') {
                          ctx.arc(
                            maskX + (maskShape.radius || 0),
                            maskY + (maskShape.radius || 0),
                            maskShape.radius || 0,
                            0,
                            Math.PI * 2
                          );
                        }
                        ctx.closePath();
                      }}
                    >
                      {shapeElement}
                    </Group>
                  );
                }

                return shapeElement;
              })}
              {/* Transformer for resize handles */}
              <Transformer
                ref={transformerRef}
                boundBoxFunc={(oldBox, newBox) => {
                  // Limit resize to minimum size
                  if (newBox.width < 5 || newBox.height < 5) {
                    return oldBox;
                  }
                  return newBox;
                }}
              />
            </Layer>
          </Stage>

          {/* Empty State */}
          {shapes.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center text-text-secondary">
                <Palette className="h-12 w-12 mx-auto mb-4 opacity-30" />
                <p className="text-base font-medium">Canvas is empty</p>
                <p className="text-xs mt-1">Use the tools above to add elements</p>
              </div>
            </div>
          )}
        </div>
        </div>
      </div>

      {/* Keyboard Shortcuts Help */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30">
        <div className="inline-flex items-center gap-4 px-4 py-2 bg-card border border-border-primary rounded-lg text-xs text-text-secondary">
          <div className="flex items-center gap-2">
            <kbd className="px-2 py-1 bg-card-hover rounded border border-border-primary font-mono">
              Click
            </kbd>
            <span>Select top-level</span>
          </div>
          <div className="w-px h-4 bg-border-primary" />
          <div className="flex items-center gap-2">
            <kbd className="px-2 py-1 bg-card-hover rounded border border-border-primary font-mono">
              Ctrl/⌘ + Click
            </kbd>
            <span>Drill down</span>
          </div>
          <div className="w-px h-4 bg-border-primary" />
          <div className="flex items-center gap-2">
            <kbd className="px-2 py-1 bg-card-hover rounded border border-border-primary font-mono">
              Double-click
            </kbd>
            <span>Enter group</span>
          </div>
        </div>
      </div>
    </main>
  );
};
