import React from 'react';
import type { Polygon, TableItem } from '../../shared/types';
import { prepareSaveData, logSaveData } from '../../shared/lib/save-utils';
import { SaveButton } from '../../shared/ui/SaveButton';

interface PolygonSavingProps {
  polygons: Polygon[];
  tableItems: TableItem[];
  className?: string;
}

export const PolygonSaving: React.FC<PolygonSavingProps> = ({
  polygons,
  tableItems,
  className = ''
}) => {
  const completedPolygons = polygons.filter(p => p.closed);
  const linkedPolygonsCount = completedPolygons.filter(p => p.linkedItem !== null).length;

  const handleSubmit = () => {
    const saveData = prepareSaveData(polygons, tableItems);
    logSaveData(saveData);
  };

  return (
    <SaveButton
      onSave={handleSubmit}
      polygonsCount={completedPolygons.length}
      linkedCount={linkedPolygonsCount}
      className={className}
    />
  );
};
