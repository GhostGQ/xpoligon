import type { Polygon } from "./polygon";
import type { TableItem } from "./table";


export interface SaveData {
  polygons: Polygon[];
  tableItems: TableItem[];
  linkedPairs: Array<{
    polygonId: string;
    tableItemId: string;
    polygonName?: string;
    tableItemName: string;
  }>;
  metadata: {
    totalPolygons: number;
    linkedPolygons: number;
    unlinkedPolygons: number;
    savedAt: string;
  };
}
