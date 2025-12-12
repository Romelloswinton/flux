'use client';

import { useState } from 'react';
import {
  Move,
  Maximize2,
  Palette,
  Code,
  Layers,
  Settings,
  Trash2,
  Download,
  Info,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MathInput } from '@/components/canvas/MathInput';
import type { ToolType, Shape } from '@/lib/types/canvas';
import type { Layer, BlendMode } from '@/lib/types/layers';

interface PropertiesPanelProps {
  activeTool: ToolType;
  selectedShape: Shape | null;
  selectedLayer: Layer | null;
  onShapeUpdate: (id: string, updates: Partial<Shape>) => void;
  onLayerUpdate: (id: string, updates: Partial<Layer>) => void;
  onShapeDelete: (id: string) => void;
  onExportClick: () => void;
}

type TabType = 'transform' | 'style' | 'component' | 'code' | 'settings';

export const PropertiesPanel = ({
  activeTool,
  selectedShape,
  selectedLayer,
  onShapeUpdate,
  onLayerUpdate,
  onShapeDelete,
  onExportClick,
}: PropertiesPanelProps) => {
  const [activeTab, setActiveTab] = useState<TabType>('transform');

  const tabs = [
    { id: 'transform' as TabType, label: 'Transform', icon: Move },
    { id: 'style' as TabType, label: 'Style', icon: Palette },
    { id: 'component' as TabType, label: 'Component', icon: Layers },
    { id: 'code' as TabType, label: 'Code', icon: Code },
    { id: 'settings' as TabType, label: 'Settings', icon: Settings },
  ];

  const handlePositionChange = (axis: 'x' | 'y', value: number) => {
    if (selectedShape) {
      onShapeUpdate(selectedShape.id, { [axis]: value });
    }
  };

  const handleSizeChange = (dimension: 'width' | 'height', value: number) => {
    if (selectedShape) {
      onShapeUpdate(selectedShape.id, { [dimension]: value });
    }
  };

  return (
    <aside className="w-80 border border-border-primary bg-card/95 backdrop-blur-md flex flex-col rounded-2xl shadow-2xl m-4 h-full overflow-hidden">
      {/* Export Button */}
      <div className="p-4 border-b border-border-primary">
        <Button
          onClick={onExportClick}
          className="w-full"
          size="default"
        >
          <Download className="mr-2 h-4 w-4" />
          Export Overlay
        </Button>
      </div>

      {/* Vertical Tabs */}
      <div className="flex border-b border-border-primary">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex flex-col items-center gap-1 px-2 py-3 text-xs font-medium transition-all ${
                activeTab === tab.id
                  ? 'text-primary bg-primary/10 border-b-2 border-b-primary'
                  : 'text-text-secondary hover:text-foreground hover:bg-card-hover'
              }`}
              title={tab.label}
            >
              <Icon className="h-4 w-4" />
              <span className="text-[10px]">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Panel Content */}
      <div className="flex-1 overflow-y-auto">
        {!selectedShape ? (
          <div className="flex flex-col items-center justify-center h-full text-text-secondary text-center px-6">
            <Maximize2 className="h-12 w-12 mb-3 opacity-30" />
            <p className="text-sm font-medium">No Selection</p>
            <p className="text-xs mt-1">Select an element to edit properties</p>
          </div>
        ) : (
          <>
            {/* Transform Tab */}
            {activeTab === 'transform' && (
              <div className="p-4 space-y-4">
                {/* Header */}
                <div className="pb-2 border-b border-border-primary">
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-xs font-semibold uppercase tracking-wide text-text-secondary">
                      Transform Properties
                    </h3>
                    <div className="group relative">
                      <Info className="h-3.5 w-3.5 text-text-muted hover:text-text-secondary cursor-help transition-colors" />
                      <div className="absolute left-0 top-full mt-1 hidden group-hover:block z-50">
                        <div className="bg-card border border-border-primary rounded-lg shadow-lg px-3 py-2 text-xs text-foreground whitespace-nowrap">
                          Supports math: <span className="text-primary font-mono">+10, *2, /2, -5px</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Position Section */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-foreground">Position</label>
                  <div className="grid grid-cols-2 gap-2">
                    <MathInput
                      label="X"
                      value={selectedShape.x}
                      onChange={(value) => handlePositionChange('x', value)}
                      unit="px"
                    />
                    <MathInput
                      label="Y"
                      value={selectedShape.y}
                      onChange={(value) => handlePositionChange('y', value)}
                      unit="px"
                    />
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    <MathInput
                      label="Z (Depth)"
                      value={0}
                      onChange={(value) => console.log('Z:', value)}
                      unit="px"
                      disabled
                    />
                  </div>
                </div>

                {/* Size Section */}
                {(selectedShape.type === 'rect' || selectedShape.type === 'text') && (
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-foreground">Size</label>
                    <div className="grid grid-cols-2 gap-2">
                      <MathInput
                        label="Width"
                        value={selectedShape.width || 0}
                        onChange={(value) => handleSizeChange('width', value)}
                        unit="px"
                      />
                      <MathInput
                        label="Height"
                        value={selectedShape.height || 0}
                        onChange={(value) => handleSizeChange('height', value)}
                        unit="px"
                      />
                    </div>
                  </div>
                )}

                {selectedShape.type === 'circle' && (
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-foreground">Size</label>
                    <MathInput
                      label="Radius"
                      value={selectedShape.radius || 0}
                      onChange={(value) =>
                        onShapeUpdate(selectedShape.id, { radius: value })
                      }
                      unit="px"
                    />
                  </div>
                )}

                {/* Rotation Section */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-foreground">Rotation</label>
                  <div className="grid grid-cols-3 gap-2">
                    <MathInput
                      label="X"
                      value={0}
                      onChange={(value) => console.log('RotateX:', value)}
                      unit="deg"
                      disabled
                    />
                    <MathInput
                      label="Y"
                      value={0}
                      onChange={(value) => console.log('RotateY:', value)}
                      unit="deg"
                      disabled
                    />
                    <MathInput
                      label="Z"
                      value={0}
                      onChange={(value) => console.log('RotateZ:', value)}
                      unit="deg"
                      disabled
                    />
                  </div>
                </div>

                {/* Shear/Skew Section */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-foreground">Shear/Skew</label>
                  <div className="grid grid-cols-2 gap-2">
                    <MathInput
                      label="X Axis"
                      value={0}
                      onChange={(value) => console.log('SkewX:', value)}
                      unit="deg"
                      disabled
                    />
                    <MathInput
                      label="Y Axis"
                      value={0}
                      onChange={(value) => console.log('SkewY:', value)}
                      unit="deg"
                      disabled
                    />
                  </div>
                </div>

                {/* Scale Section */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-foreground">Scale</label>
                  <div className="grid grid-cols-2 gap-2">
                    <MathInput
                      label="X Scale"
                      value={1}
                      onChange={(value) => console.log('ScaleX:', value)}
                      unit="×"
                      step={0.1}
                      disabled
                    />
                    <MathInput
                      label="Y Scale"
                      value={1}
                      onChange={(value) => console.log('ScaleY:', value)}
                      unit="×"
                      step={0.1}
                      disabled
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Style Tab */}
            {activeTab === 'style' && (
              <div className="p-4 space-y-4">
                <div className="pb-2 border-b border-border-primary">
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-text-secondary">
                    Style Properties
                  </h3>
                </div>

                {/* Fill Color */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-foreground">Fill</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={selectedShape.fill}
                      onChange={(e) => {
                        onShapeUpdate(selectedShape.id, { fill: e.target.value });
                      }}
                      className="w-12 h-12 rounded-lg cursor-pointer border border-border-primary"
                    />
                    <input
                      type="text"
                      value={selectedShape.fill}
                      onChange={(e) => {
                        onShapeUpdate(selectedShape.id, { fill: e.target.value });
                      }}
                      className="flex-1 px-3 py-2 text-xs bg-card-hover border border-border-primary rounded-lg focus:outline-none focus:border-primary font-mono"
                    />
                  </div>
                </div>

                {/* Text Content */}
                {selectedShape.type === 'text' && (
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-foreground">Text</label>
                    <textarea
                      value={selectedShape.text || ''}
                      onChange={(e) => {
                        onShapeUpdate(selectedShape.id, { text: e.target.value });
                      }}
                      className="w-full px-3 py-2 text-xs bg-card-hover border border-border-primary rounded-lg focus:outline-none focus:border-primary resize-none"
                      rows={3}
                    />
                  </div>
                )}

                {/* Layer Properties - Blend Mode & Opacity */}
                {selectedLayer && (
                  <>
                    <div className="pt-2 border-t border-border-primary">
                      <h4 className="text-xs font-semibold text-foreground mb-3">Layer Properties</h4>
                    </div>

                    {/* Blend Mode */}
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-foreground">Blend Mode</label>
                      <select
                        value={selectedLayer.blendMode}
                        onChange={(e) => {
                          onLayerUpdate(selectedLayer.id, { blendMode: e.target.value as BlendMode });
                        }}
                        className="w-full px-3 py-2 text-xs bg-card-hover border border-border-primary rounded-lg focus:outline-none focus:border-primary"
                      >
                        <option value="normal">Normal</option>
                        <option value="multiply">Multiply</option>
                        <option value="screen">Screen</option>
                        <option value="overlay">Overlay</option>
                        <option value="darken">Darken</option>
                        <option value="lighten">Lighten</option>
                        <option value="color-dodge">Color Dodge</option>
                        <option value="color-burn">Color Burn</option>
                        <option value="hard-light">Hard Light</option>
                        <option value="soft-light">Soft Light</option>
                        <option value="difference">Difference</option>
                        <option value="exclusion">Exclusion</option>
                      </select>
                    </div>

                    {/* Opacity */}
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-foreground">
                        Opacity: {Math.round(selectedLayer.opacity)}%
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={selectedLayer.opacity}
                        onChange={(e) => {
                          onLayerUpdate(selectedLayer.id, { opacity: Number(e.target.value) });
                        }}
                        className="w-full accent-primary"
                      />
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Component Tab */}
            {activeTab === 'component' && (
              <div className="p-4 space-y-4">
                <div className="pb-2 border-b border-border-primary">
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-text-secondary">
                    Component Overrides
                  </h3>
                </div>
                <div className="text-xs text-text-secondary">
                  Component override features coming soon...
                </div>
              </div>
            )}

            {/* Code Tab */}
            {activeTab === 'code' && (
              <div className="p-4 space-y-4">
                <div className="pb-2 border-b border-border-primary">
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-text-secondary">
                    Code Interactions
                  </h3>
                </div>
                <div className="text-xs text-text-secondary">
                  Live code binding features coming soon...
                </div>
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <div className="p-4 space-y-4">
                <div className="pb-2 border-b border-border-primary">
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-text-secondary">
                    Element Settings
                  </h3>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-text-secondary">Type</label>
                    <p className="text-sm font-medium capitalize mt-1">{selectedShape.type}</p>
                  </div>

                  <div>
                    <label className="text-xs text-text-secondary">ID</label>
                    <p className="text-xs font-mono text-text-muted mt-1 break-all">
                      {selectedShape.id}
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-border-primary">
                  <Button
                    variant="destructive"
                    size="sm"
                    className="w-full"
                    onClick={() => onShapeDelete(selectedShape.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-2" />
                    Delete Element
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </aside>
  );
};
