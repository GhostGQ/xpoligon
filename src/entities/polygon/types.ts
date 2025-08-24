import type { Point } from '../../shared/types';

export interface Polygon {
  id: string;
  points: Point[];
  closed: boolean;
  linkedItem: string | null;
}

export type DragState = {
  isDragging: boolean;
  dragType: 'polygon' | 'point' | null;
  polygonIndex: number;
  pointIndex: number;
  startPos: Point;
  startTime: number;
};
