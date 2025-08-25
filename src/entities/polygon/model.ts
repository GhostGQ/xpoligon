import type { RelativePoint } from '../../shared/types';

export interface Polygon {
  points: RelativePoint[];
  closed: boolean;
  linkedItem: string | null;
  id: string;
}
