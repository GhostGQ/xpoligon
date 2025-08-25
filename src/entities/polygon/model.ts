import type { RelativePoint } from '../../shared/types';

export interface Polygon {
  id: string;
  points: RelativePoint[];
  closed: boolean;
  linkedWorkplace: string | null; // ID рабочего места
  cameraId: string; // ID камеры, к которой привязан полигон
}
