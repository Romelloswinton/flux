'use client';

import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LayerItem } from './LayerItem';
import { StackingContextInfo } from './StackingContextInfo';
import type { Layer, BlendMode } from '@/lib/types/layers';

interface LayersPanelProps {
  layers: Layer[];
  selectedLayerId: string | null;
  selectedLayerIds?: string[];
  onLayerSelect: (id: string, event?: React.MouseEvent) => void;
  onLayerAdd: (type: 'shape' | 'text') => void;
  onLayerDelete: (id: string) => void;
  onLayerUpdate: (id: string, updates: Partial<Layer>) => void;
  onContextMenuAction?: (action: string, layerId: string) => void;
}

export const LayersPanel = ({
  layers,
  selectedLayerId,
  selectedLayerIds = [],
  onLayerSelect,
  onLayerAdd,
  onLayerDelete,
  onLayerUpdate,
  onContextMenuAction,
}: LayersPanelProps) => {
  const [expandedLayers, setExpandedLayers] = useState<Set<string>>(new Set());

  const handleToggleExpand = (id: string) => {
    const newExpanded = new Set(expandedLayers);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedLayers(newExpanded);
  };

  const handleToggleVisibility = (id: string) => {
    const layer = findLayer(layers, id);
    if (layer) {
      onLayerUpdate(id, { visible: !layer.visible });
    }
  };

  const handleToggleLock = (id: string) => {
    const layer = findLayer(layers, id);
    if (layer) {
      onLayerUpdate(id, { locked: !layer.locked });
    }
  };

  const handleBlendModeChange = (id: string, blendMode: BlendMode) => {
    onLayerUpdate(id, { blendMode });
  };

  const handleOpacityChange = (id: string, opacity: number) => {
    onLayerUpdate(id, { opacity });
  };

  const findLayer = (layers: Layer[], id: string): Layer | null => {
    for (const layer of layers) {
      if (layer.id === id) return layer;
      if (layer.children) {
        const found = findLayer(layer.children, id);
        if (found) return found;
      }
    }
    return null;
  };

  const selectedLayer = selectedLayerId ? findLayer(layers, selectedLayerId) : null;

  return (
    <div className="flex flex-col h-full">
      {/* Header with Actions */}
      <div className="p-3 border-b border-border-primary">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold">Layers</h3>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => onLayerAdd('shape')}
              title="Add layer"
            >
              <Plus className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => selectedLayerId && onLayerDelete(selectedLayerId)}
              disabled={!selectedLayerId}
              title="Delete layer"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Layers List */}
      <div className="flex-1 overflow-y-auto">
        {layers.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-text-secondary p-8 text-center">
            <Plus className="h-12 w-12 mb-3 opacity-30" />
            <p className="text-sm">No layers yet</p>
            <p className="text-xs mt-1">Add a layer to get started</p>
          </div>
        ) : (
          <div className="py-1">
            {layers.map((layer, index) => (
              <LayerItem
                key={layer.id}
                layer={layer}
                isSelected={selectedLayerId === layer.id || selectedLayerIds.includes(layer.id)}
                selectedLayerId={selectedLayerId}
                selectedLayerIds={selectedLayerIds}
                onSelect={onLayerSelect}
                onToggleVisibility={handleToggleVisibility}
                onToggleLock={handleToggleLock}
                onToggleExpand={handleToggleExpand}
                isExpanded={expandedLayers.has(layer.id)}
                onContextMenuAction={onContextMenuAction}
              />
            ))}
          </div>
        )}
      </div>

      {/* Stacking Context Info (when layer is selected) */}
      {selectedLayer && (
        <div className="p-3 border-t border-border-primary">
          <StackingContextInfo
            layerName={selectedLayer.name}
            depth={0}
            localZIndex={layers.findIndex((l) => l.id === selectedLayer.id)}
            isInStackingContext={selectedLayer.type === 'group' || selectedLayer.type === 'adjustment'}
          />
        </div>
      )}
    </div>
  );
};
