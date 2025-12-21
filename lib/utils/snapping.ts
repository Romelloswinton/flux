import type { Shape } from '@/lib/types/canvas';

export interface SnapGuide {
  type: 'vertical' | 'horizontal';
  position: number;
}

export interface SnapResult {
  x: number;
  y: number;
  guides: SnapGuide[];
}

const SNAP_THRESHOLD = 10;

export function calculateSnap(
  draggedShape: Shape,
  allShapes: Shape[],
  newX: number,
  newY: number,
  enabled: boolean = true
): SnapResult {
  if (!enabled) {
    return { x: newX, y: newY, guides: [] };
  }

  const guides: SnapGuide[] = [];
  let snappedX = newX;
  let snappedY = newY;

  // Get bounds of dragged shape
  const draggedWidth = draggedShape.width || draggedShape.radius || 0;
  const draggedHeight = draggedShape.height || draggedShape.radius || 0;
  const draggedCenterX = newX + draggedWidth / 2;
  const draggedCenterY = newY + draggedHeight / 2;
  const draggedRight = newX + draggedWidth;
  const draggedBottom = newY + draggedHeight;

  // Check against other shapes
  for (const shape of allShapes) {
    if (shape.id === draggedShape.id) continue;

    const shapeWidth = shape.width || shape.radius || 0;
    const shapeHeight = shape.height || shape.radius || 0;
    const shapeCenterX = shape.x + shapeWidth / 2;
    const shapeCenterY = shape.y + shapeHeight / 2;
    const shapeRight = shape.x + shapeWidth;
    const shapeBottom = shape.y + shapeHeight;

    // Vertical snapping (X-axis)
    // Left edges
    if (Math.abs(newX - shape.x) < SNAP_THRESHOLD) {
      snappedX = shape.x;
      guides.push({ type: 'vertical', position: shape.x });
    }
    // Center alignment
    else if (Math.abs(draggedCenterX - shapeCenterX) < SNAP_THRESHOLD) {
      snappedX = shapeCenterX - draggedWidth / 2;
      guides.push({ type: 'vertical', position: shapeCenterX });
    }
    // Right edges
    else if (Math.abs(draggedRight - shapeRight) < SNAP_THRESHOLD) {
      snappedX = shapeRight - draggedWidth;
      guides.push({ type: 'vertical', position: shapeRight });
    }

    // Horizontal snapping (Y-axis)
    // Top edges
    if (Math.abs(newY - shape.y) < SNAP_THRESHOLD) {
      snappedY = shape.y;
      guides.push({ type: 'horizontal', position: shape.y });
    }
    // Middle alignment
    else if (Math.abs(draggedCenterY - shapeCenterY) < SNAP_THRESHOLD) {
      snappedY = shapeCenterY - draggedHeight / 2;
      guides.push({ type: 'horizontal', position: shapeCenterY });
    }
    // Bottom edges
    else if (Math.abs(draggedBottom - shapeBottom) < SNAP_THRESHOLD) {
      snappedY = shapeBottom - draggedHeight;
      guides.push({ type: 'horizontal', position: shapeBottom });
    }
  }

  return { x: snappedX, y: snappedY, guides };
}
