import type { Polygon } from './polygon';
import type { TableItem } from './table';

export interface CameraData {
  cameraId: string;
  polygons: Polygon[];
  tableItems: TableItem[];
  lastSaved: string;
  version: number;
}

export interface CameraResponse {
  cameraId: string;
  name: string;
  polygons?: Polygon[];
  tableItems?: TableItem[];
}

export interface LocalStorageData {
  [cameraId: string]: CameraData;
}
