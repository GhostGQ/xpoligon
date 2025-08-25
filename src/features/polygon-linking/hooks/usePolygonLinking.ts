import { useCallback } from 'react';
import type { Polygon } from '../../../entities/polygon';
import type { Workplace } from '../../../entities/workplace';

interface UsePolygonLinkingProps {
  polygons: Polygon[];
  workplaces: Workplace[];
  setPolygons: React.Dispatch<React.SetStateAction<Polygon[]>>;
}

export const usePolygonLinking = ({ setPolygons }: UsePolygonLinkingProps) => {
  const linkPolygonToItem = useCallback((polygonId: string, workplaceId: string) => {
    // Отвязываем предыдущие связи
    setPolygons(prev => prev.map(polygon => ({
      ...polygon,
      linkedWorkplace: polygon.id === polygonId ? workplaceId : 
        (polygon.linkedWorkplace === workplaceId ? null : polygon.linkedWorkplace)
    })));
  }, [setPolygons]);

  const unlinkItem = useCallback((workplaceId: string) => {
    setPolygons(prev => prev.map(polygon => 
      polygon.linkedWorkplace === workplaceId 
        ? { ...polygon, linkedWorkplace: null }
        : polygon
    ));
  }, [setPolygons]);

  const unlinkPolygon = useCallback((polygonId: string) => {
    setPolygons(prev => prev.map(p => 
      p.id === polygonId ? { ...p, linkedWorkplace: null } : p
    ));
  }, [setPolygons]);

  return {
    linkPolygonToItem,
    unlinkItem,
    unlinkPolygon
  };
};
