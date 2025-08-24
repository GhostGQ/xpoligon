import type { Polygon, TableItem, SaveData } from '../types';

export const prepareSaveData = (
  polygons: Polygon[],
  tableItems: TableItem[]
): SaveData => {
  const completedPolygons = polygons.filter(p => p.closed);
  const linkedPolygons = completedPolygons.filter(p => p.linkedItem !== null);
  const unlinkedPolygons = completedPolygons.filter(p => p.linkedItem === null);

  const linkedPairs = linkedPolygons.map(polygon => {
    const linkedTable = tableItems.find(item => item.id === polygon.linkedItem);
    return {
      polygonId: polygon.id,
      tableItemId: polygon.linkedItem!,
      tableItemName: linkedTable?.name || 'Неизвестный элемент'
    };
  });

  return {
    polygons: completedPolygons,
    tableItems,
    linkedPairs,
    metadata: {
      totalPolygons: completedPolygons.length,
      linkedPolygons: linkedPolygons.length,
      unlinkedPolygons: unlinkedPolygons.length,
      savedAt: new Date().toISOString()
    }
  };
};

export const logSaveData = (saveData: SaveData): void => {
  console.group('🔄 Данные полигонов для сохранения');
  
  console.log('📊 Метаданные:', {
    'Общее количество полигонов': saveData.metadata.totalPolygons,
    'Привязанные полигоны': saveData.metadata.linkedPolygons,
    'Непривязанные полигоны': saveData.metadata.unlinkedPolygons,
    'Время сохранения': saveData.metadata.savedAt
  });

  console.log('🔗 Привязки полигон-элемент:', saveData.linkedPairs.map(pair => ({
    polygonId: pair.polygonId,
    elementName: pair.tableItemName
  })));

  console.log('📐 Полигоны:', saveData.polygons.map(polygon => ({
    id: polygon.id,
    pointsCount: polygon.points.length,
    isLinked: polygon.linkedItem !== null,
    linkedTo: polygon.linkedItem
  })));

  console.log('🏷️ Полный объект данных:', saveData);
  
  console.groupEnd();
};
