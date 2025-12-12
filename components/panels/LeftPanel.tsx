'use client';

import { useState } from 'react';
import { Layers, Package } from 'lucide-react';
import { LayersPanel } from './LayersPanel';
import { AssetsPanel } from './AssetsPanel';
import type { Layer, Asset, AssetCategory, BlendMode } from '@/lib/types/layers';

interface LeftPanelProps {
  // Layers
  layers: Layer[];
  selectedLayerId: string | null;
  selectedLayerIds?: string[];
  onLayerSelect: (id: string, event?: React.MouseEvent) => void;
  onLayerAdd: (type: 'shape' | 'text') => void;
  onLayerDelete: (id: string) => void;
  onLayerUpdate: (id: string, updates: Partial<Layer>) => void;
  onContextMenuAction?: (action: string, layerId: string) => void;

  // Assets
  assets: Asset[];
  assetCategories: AssetCategory[];
  onAssetSelect: (asset: Asset) => void;
  onAssetCreate: () => void;
}

type TabType = 'layers' | 'assets';

export const LeftPanel = ({
  layers,
  selectedLayerId,
  selectedLayerIds = [],
  onLayerSelect,
  onLayerAdd,
  onLayerDelete,
  onLayerUpdate,
  onContextMenuAction,
  assets,
  assetCategories,
  onAssetSelect,
  onAssetCreate,
}: LeftPanelProps) => {
  const [activeTab, setActiveTab] = useState<TabType>('layers');

  return (
    <aside className="w-72 border border-border-primary bg-card/95 backdrop-blur-md flex flex-col rounded-2xl shadow-2xl m-4 h-full">
      {/* Tab Switcher */}
      <div className="flex border-b border-border-primary p-2 gap-1">
        <button
          onClick={() => setActiveTab('layers')}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium transition-all rounded-lg relative ${
            activeTab === 'layers'
              ? 'text-primary bg-primary/10'
              : 'text-text-secondary hover:text-foreground hover:bg-card-hover'
          }`}
        >
          <Layers className="h-4 w-4" />
          Layers
        </button>

        <button
          onClick={() => setActiveTab('assets')}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium transition-all rounded-lg relative ${
            activeTab === 'assets'
              ? 'text-primary bg-primary/10'
              : 'text-text-secondary hover:text-foreground hover:bg-card-hover'
          }`}
        >
          <Package className="h-4 w-4" />
          Assets
        </button>
      </div>

      {/* Panel Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'layers' ? (
          <LayersPanel
            layers={layers}
            selectedLayerId={selectedLayerId}
            selectedLayerIds={selectedLayerIds}
            onLayerSelect={onLayerSelect}
            onLayerAdd={onLayerAdd}
            onLayerDelete={onLayerDelete}
            onLayerUpdate={onLayerUpdate}
            onContextMenuAction={onContextMenuAction}
          />
        ) : (
          <AssetsPanel
            assets={assets}
            categories={assetCategories}
            onAssetSelect={onAssetSelect}
            onAssetCreate={onAssetCreate}
          />
        )}
      </div>
    </aside>
  );
};
