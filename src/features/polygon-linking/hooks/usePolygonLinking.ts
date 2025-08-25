import { useCallback } from 'react';
import type { Polygon } from '../../../entities/polygon';
import type { TableItem } from '../../../entities/table-item';

interface UsePolygonLinkingProps {
  polygons: Polygon[];
  tableItems: TableItem[];
  setPolygons: React.Dispatch<React.SetStateAction<Polygon[]>>;
  setTableItems: React.Dispatch<React.SetStateAction<TableItem[]>>;
}

export const usePolygonLinking = ({ polygons, tableItems, setPolygons, setTableItems }: UsePolygonLinkingProps) => {
  const linkPolygonToItem = useCallback((polygonId: string, itemId: string) => {
    // Отвязываем предыдущие связи
    setTableItems(prev => prev.map(item => ({
      ...item,
      linkedPolygon: item.linkedPolygon === polygonId ? null : item.linkedPolygon
    })));

    setPolygons(prev => prev.map(polygon => ({
      ...polygon,
      linkedItem: polygon.id === polygonId ? null : polygon.linkedItem
    })));

    // Создаем новую связь
    setTableItems(prev => prev.map(item => 
      item.id === itemId 
        ? { ...item, linkedPolygon: polygonId }
        : item
    ));

    setPolygons(prev => prev.map(polygon => 
      polygon.id === polygonId 
        ? { ...polygon, linkedItem: itemId }
        : polygon
    ));
  }, [setPolygons, setTableItems]);

  const unlinkItem = useCallback((itemId: string) => {
    const item = tableItems.find(t => t.id === itemId);
    if (!item || !item.linkedPolygon) return;

    setTableItems(prev => prev.map(t => 
      t.id === itemId ? { ...t, linkedPolygon: null } : t
    ));

    setPolygons(prev => prev.map(polygon => 
      polygon.id === item.linkedPolygon ? { ...polygon, linkedItem: null } : polygon
    ));
  }, [tableItems, setPolygons, setTableItems]);

  const unlinkPolygon = useCallback((polygonId: string) => {
    const polygon = polygons.find(p => p.id === polygonId);
    if (!polygon || !polygon.linkedItem) return;

    setTableItems(prev => prev.map(item => 
      item.id === polygon.linkedItem ? { ...item, linkedPolygon: null } : item
    ));

    setPolygons(prev => prev.map(p => 
      p.id === polygonId ? { ...p, linkedItem: null } : p
    ));
  }, [polygons, setPolygons, setTableItems]);

  return {
    linkPolygonToItem,
    unlinkItem,
    unlinkPolygon
  };
};
