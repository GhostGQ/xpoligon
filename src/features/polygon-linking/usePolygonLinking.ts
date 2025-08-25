import { useCallback } from 'react';
import type { Polygon } from '../../entities/polygon';
import type { TableItem } from '../../entities/table';
import { CameraStorageService } from '@/shared/lib';

export interface UsePolygonLinkingProps {
  polygons: Polygon[];
  setPolygons: React.Dispatch<React.SetStateAction<Polygon[]>>;
  tableItems: TableItem[];
  setTableItems: React.Dispatch<React.SetStateAction<TableItem[]>>;
  selectedPolygon: string | null;
  setSelectedPolygon: React.Dispatch<React.SetStateAction<string | null>>;
  cameraId: string;
}

export const usePolygonLinking = ({
  setPolygons,
  tableItems,
  setTableItems,
  selectedPolygon,
  setSelectedPolygon,
  cameraId
}: UsePolygonLinkingProps) => {
  const linkPolygonToItem = useCallback(
    (itemId: string) => {
      if (!selectedPolygon) return;

      // Отвязываем предыдущие связи
      setTableItems(prev =>
        prev.map(item => ({
          ...item,
          linkedPolygon:
            item.linkedPolygon === selectedPolygon ? null : item.linkedPolygon,
        }))
      );

      setPolygons(prev =>
        prev.map(polygon => ({
          ...polygon,
          linkedItem:
            polygon.id === selectedPolygon ? null : polygon.linkedItem,
        }))
      );

      // Создаем новую связь
      setTableItems(prev =>
        prev.map(item =>
          item.id === itemId ? { ...item, linkedPolygon: selectedPolygon } : item
        )
      );

      setPolygons(prev =>
        prev.map(polygon =>
          polygon.id === selectedPolygon
            ? { ...polygon, linkedItem: itemId }
            : polygon
        )
      );
    },
    [selectedPolygon, setTableItems, setPolygons]
  );

  const unlinkItem = useCallback(
    (itemId: string) => {
      const item = tableItems.find(t => t.id === itemId);
      if (!item || !item.linkedPolygon) return;

      setTableItems(prev =>
        prev.map(t => (t.id === itemId ? { ...t, linkedPolygon: null } : t))
      );

      setPolygons(prev =>
        prev.map(polygon =>
          polygon.id === item.linkedPolygon
            ? { ...polygon, linkedItem: null }
            : polygon
        )
      );
    },
    [tableItems, setTableItems, setPolygons]
  );

  const deletePolygon = useCallback(
    (cameraId: string, polygonId: string) => {
      setPolygons(prev => prev.filter(p => p.id !== polygonId));
      CameraStorageService.deleteCameraPoligon(cameraId, polygonId);
      // Отвязываем от элементов списка
      setTableItems(prev =>
        prev.map(item =>
          item.linkedPolygon === polygonId
            ? { ...item, linkedPolygon: null }
            : item
        )
      );

      setSelectedPolygon(null);
    },
    [setPolygons, setTableItems, setSelectedPolygon]
  );

  const clearAll = useCallback(() => {
    CameraStorageService.clearCameraData(cameraId);
    setPolygons([]);
    setSelectedPolygon(null);
    setTableItems(prev =>
      prev.map(item => ({ ...item, linkedPolygon: null }))
    );
  }, [setPolygons, setSelectedPolygon, setTableItems]);

  return {
    linkPolygonToItem,
    unlinkItem,
    deletePolygon,
    clearAll,
  };
};
