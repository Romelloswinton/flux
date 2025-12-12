export type LayerType = 'shape' | 'text' | 'image' | 'group' | 'adjustment' | 'mask';

export type BlendMode =
  | 'normal'
  | 'multiply'
  | 'screen'
  | 'overlay'
  | 'darken'
  | 'lighten'
  | 'color-dodge'
  | 'color-burn'
  | 'hard-light'
  | 'soft-light'
  | 'difference'
  | 'exclusion';

export type AdjustmentType =
  | 'brightness-contrast'
  | 'hue-saturation'
  | 'color-balance'
  | 'curves'
  | 'levels';

export interface Layer {
  id: string;
  name: string;
  type: LayerType;
  visible: boolean;
  locked: boolean;
  opacity: number;
  blendMode: BlendMode;
  children?: Layer[];

  // Transform properties (local to parent)
  x?: number;
  y?: number;
  scaleX?: number;
  scaleY?: number;
  rotation?: number;

  // Mask properties
  hasMask?: boolean;
  maskVisible?: boolean;
  isMask?: boolean; // This layer is being used as a mask
  maskTargetId?: string; // ID of the layer this mask is applied to

  // Adjustment layer properties
  adjustmentType?: AdjustmentType;
  adjustmentSettings?: Record<string, any>;

  // Stacking context
  createsStackingContext?: boolean;

  // Thumbnail
  thumbnail?: string;
}

export interface Asset {
  id: string;
  name: string;
  type: 'component' | 'template' | 'preset';
  category: string;
  thumbnail?: string;
  data: any;
  createdAt: Date;
}

export interface AssetCategory {
  id: string;
  name: string;
  icon?: string;
}
