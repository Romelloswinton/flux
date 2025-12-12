'use client';

import { useState, useEffect } from 'react';
import {
  MousePointer2,
  Hand,
  Pencil,
  Image as ImageIcon,
  Layers,
  Square,
  Diamond,
  Pentagon,
  Circle as CircleIcon,
  Type,
  ChevronDown,
} from 'lucide-react';
import type { ToolType } from '@/lib/types/canvas';

interface ToolsPaletteProps {
  activeTool: ToolType;
  onToolChange: (tool: ToolType) => void;
}

const shapeTools = [
  { id: 'rect', icon: Square, label: 'Rectangle', shortcut: 'R' },
  { id: 'diamond', icon: Diamond, label: 'Diamond', shortcut: '' },
  { id: 'polygon', icon: Pentagon, label: 'Polygon', shortcut: '' },
];

const otherTools = [
  { id: 'select', icon: MousePointer2, label: 'Select', shortcut: 'V' },
  { id: 'hand', icon: Hand, label: 'Hand', shortcut: 'H' },
  { id: 'circle', icon: CircleIcon, label: 'Circle', shortcut: 'O' },
  { id: 'text', icon: Type, label: 'Text', shortcut: 'T' },
  { id: 'pen', icon: Pencil, label: 'Pen', shortcut: 'P' },
  { id: 'image', icon: ImageIcon, label: 'Image', shortcut: 'I' },
];

export const ToolsPalette = ({ activeTool, onToolChange }: ToolsPaletteProps) => {
  const [showShapeMenu, setShowShapeMenu] = useState(false);
  const [selectedShape, setSelectedShape] = useState<ToolType>('rect');

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setShowShapeMenu(false);
    if (showShapeMenu) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showShapeMenu]);

  // Update selected shape when activeTool changes
  useEffect(() => {
    if (activeTool === 'rect' || activeTool === 'diamond' || activeTool === 'polygon') {
      setSelectedShape(activeTool);
    }
  }, [activeTool]);

  const currentShapeTool = shapeTools.find(t => t.id === selectedShape) || shapeTools[0];
  const CurrentShapeIcon = currentShapeTool.icon;
  const isShapeActive = activeTool === 'rect' || activeTool === 'diamond' || activeTool === 'polygon';

  const handleShapeSelect = (shapeId: ToolType) => {
    setSelectedShape(shapeId);
    onToolChange(shapeId);
    setShowShapeMenu(false);
  };

  return (
    <div className="bg-card/95 backdrop-blur-md border border-border-primary rounded-xl shadow-2xl px-2 py-2 flex items-center gap-1">
      {/* Select and Hand tools */}
      {otherTools.slice(0, 2).map((tool) => {
        const Icon = tool.icon;
        const isActive = activeTool === tool.id;
        return (
          <button
            key={tool.id}
            onClick={() => onToolChange(tool.id as ToolType)}
            className={`relative group p-2 rounded-lg transition-all ${
              isActive
                ? 'bg-primary text-white'
                : 'text-text-secondary hover:bg-card-hover hover:text-foreground'
            }`}
            title={`${tool.label} (${tool.shortcut})`}
          >
            <Icon className="h-5 w-5" />
            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-card border border-border-primary rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
              {tool.label}
              <span className="ml-2 text-text-muted">{tool.shortcut}</span>
            </div>
          </button>
        );
      })}

      {/* Shape Tools Dropdown */}
      <div className="relative">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowShapeMenu(!showShapeMenu);
          }}
          className={`relative group p-2 rounded-lg transition-all flex items-center gap-1 ${
            isShapeActive
              ? 'bg-primary text-white'
              : 'text-text-secondary hover:bg-card-hover hover:text-foreground'
          }`}
          title={currentShapeTool.label}
        >
          <CurrentShapeIcon className="h-5 w-5" />
          <ChevronDown className="h-3 w-3" />
          {/* Tooltip */}
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-card border border-border-primary rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
            {currentShapeTool.label}
            {currentShapeTool.shortcut && <span className="ml-2 text-text-muted">{currentShapeTool.shortcut}</span>}
          </div>
        </button>

        {/* Dropdown Menu */}
        {showShapeMenu && (
          <div className="absolute top-full left-0 mt-2 bg-card/95 backdrop-blur-sm border border-border-primary rounded-lg shadow-2xl py-1 z-50 min-w-40">
            {shapeTools.map((shape) => {
              const Icon = shape.icon;
              return (
                <button
                  key={shape.id}
                  onClick={() => handleShapeSelect(shape.id as ToolType)}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-accent transition-colors text-left"
                >
                  <Icon className="h-4 w-4" />
                  {shape.label}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Other tools (Circle, Text, Pen, Image) */}
      {otherTools.slice(2).map((tool) => {
        const Icon = tool.icon;
        const isActive = activeTool === tool.id;
        return (
          <button
            key={tool.id}
            onClick={() => onToolChange(tool.id as ToolType)}
            className={`relative group p-2 rounded-lg transition-all ${
              isActive
                ? 'bg-primary text-white'
                : 'text-text-secondary hover:bg-card-hover hover:text-foreground'
            }`}
            title={`${tool.label} (${tool.shortcut})`}
          >
            <Icon className="h-5 w-5" />
            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-card border border-border-primary rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
              {tool.label}
              <span className="ml-2 text-text-muted">{tool.shortcut}</span>
            </div>
          </button>
        );
      })}

      {/* Separator */}
      <div className="w-px h-6 bg-border-primary mx-1" />

      {/* Layers Panel Toggle */}
      <button
        className="p-2 rounded-lg text-text-secondary hover:bg-card-hover hover:text-foreground transition-all"
        title="Layers"
      >
        <Layers className="h-5 w-5" />
      </button>
    </div>
  );
};
