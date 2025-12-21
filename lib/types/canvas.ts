export type ShapeType = 'rect' | 'diamond' | 'polygon' | 'circle' | 'text';

export interface Shape {
  id: string;
  type: ShapeType;
  x: number;
  y: number;
  fill: string;
  width?: number;
  height?: number;
  radius?: number;
  text?: string;
  points?: number[]; // For polygon shapes
  rotation?: number; // Rotation in degrees
  fontSize?: number; // Font size for text shapes

  // Layer metadata (applied from layer properties)
  _layerVisible?: boolean;
  _layerLocked?: boolean;
  _layerOpacity?: number;
  _layerBlendMode?: string;
}

export interface Collaborator {
  id: number;
  name: string;
  avatar: string;
  color: string;
}

export type SaveStatus = 'saved' | 'saving' | 'unsaved';
export type ToolType = 'select' | 'hand' | 'rect' | 'diamond' | 'polygon' | 'circle' | 'text' | 'pen' | 'image';
