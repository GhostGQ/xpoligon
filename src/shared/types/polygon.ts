import type { Point } from './geometry';

export interface Polygon {
  id: string;
  points: Point[];
  closed: boolean;
  linkedItem: string | null;
}
