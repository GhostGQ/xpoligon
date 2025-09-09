import { useEffect, useRef } from 'react';
import type { Polygon } from '../../entities/polygon';

interface UsePolygonChangesProps {
  polygons: Polygon[];
  onChange?: (polygons: Polygon[]) => void;
}

export const usePolygonChanges = ({ polygons, onChange }: UsePolygonChangesProps) => {
  const isInitialLoad = useRef(true);

  // Вызываем onChange при любом изменении полигонов (кроме первого рендера)
  useEffect(() => {
    if (!isInitialLoad.current) {
      onChange?.(polygons);
    } else {
      isInitialLoad.current = false;
    }
  }, [polygons, onChange]);
};
