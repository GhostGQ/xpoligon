import React, { useState, useEffect } from 'react';
import type { Polygon } from '../../entities/polygon';
import type { TableItem } from '../../entities/table-item';
import { generateId, useImageProcessing, useCanvasDimensions } from '../../shared/lib';
import { usePolygonLinking } from '../../features/polygon-linking';
import { PolygonCanvas } from '../../widgets/polygon-canvas';
import { ItemsPanel } from '../../widgets/items-panel';
import { Button } from '../../shared/ui';

interface PolygonEditorPageProps {
  cameraImage?: string;
}

export const PolygonEditorPage: React.FC<PolygonEditorPageProps> = ({ 
  cameraImage 
}) => {
  const canvasDimensions = useCanvasDimensions();
  const { backgroundImage, imageInfo } = useImageProcessing({ cameraImage, canvasDimensions });

  const [polygons, setPolygons] = useState<Polygon[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [selectedPolygon, setSelectedPolygon] = useState<string | null>(null);

  // Список столов (моковые данные)
  const [tableItems, setTableItems] = useState<TableItem[]>([
    { id: '1', name: 'Стол № 1', linkedPolygon: null },
    { id: '2', name: 'Стол № 2', linkedPolygon: null },
    { id: '3', name: 'Стол № 3', linkedPolygon: null },
    { id: '4', name: 'Стол № 4', linkedPolygon: null },
    { id: '5', name: 'Стол № 5', linkedPolygon: null },
    { id: '6', name: 'Стол № 6', linkedPolygon: null },
  ]);

  const { linkPolygonToItem, unlinkItem } = usePolygonLinking({
    polygons,
    tableItems,
    setPolygons,
    setTableItems
  });

  // Обработка клавиш Delete и Backspace
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedPolygon) {
        e.preventDefault();
        deletePolygon(selectedPolygon);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [selectedPolygon]);

  const deletePolygon = (polygonId: string) => {
    setPolygons(prev => prev.filter(p => p.id !== polygonId));
    
    // Отвязываем от элементов списка
    setTableItems(prev => prev.map(item => 
      item.linkedPolygon === polygonId 
        ? { ...item, linkedPolygon: null }
        : item
    ));
    
    setSelectedPolygon(null);
  };

  const clearAll = () => {
    setPolygons([]);
    setIsDrawing(false);
    setSelectedPolygon(null);
    setTableItems(prev => prev.map(item => ({ ...item, linkedPolygon: null })));
  };

  const handleLinkPolygonToItem = (itemId: string) => {
    if (selectedPolygon) {
      linkPolygonToItem(selectedPolygon, itemId);
    }
  };

  return (
    <div className="flex gap-4 p-4 h-screen overflow-hidden">
      {/* Основная область с canvas */}
      <div className="flex flex-col gap-4 flex-1">
        <div className="bg-gray-100 p-3 rounded-lg flex justify-between items-center">
          <div>
            <h2 className="text-lg font-bold mb-1">Редактор полигонов (относительные координаты)</h2>
            <div className="text-sm text-gray-600">
              {backgroundImage ? 
                `Загружено изображение ${imageInfo?.width}×${imageInfo?.height}px` : 
                'Режим сетки (нет изображения)'
              }
              {imageInfo && (
                <span className="ml-2 text-blue-600">
                  Масштаб: {(imageInfo.scale * 100).toFixed(1)}%
                </span>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            {selectedPolygon && (
              <Button 
                onClick={() => deletePolygon(selectedPolygon)}
                variant="warning"
                title="Delete/Backspace"
              >
                Удалить выбранный
              </Button>
            )}
            <Button 
              onClick={clearAll}
              variant="danger"
            >
              Очистить все
            </Button>
          </div>
        </div>
        
        <div className="border-2 border-gray-300 rounded-lg overflow-hidden flex-1">
          <PolygonCanvas
            canvasDimensions={canvasDimensions}
            backgroundImage={backgroundImage}
            imageInfo={imageInfo}
            polygons={polygons}
            setPolygons={setPolygons}
            isDrawing={isDrawing}
            setIsDrawing={setIsDrawing}
            selectedPolygon={selectedPolygon}
            setSelectedPolygon={setSelectedPolygon}
            tableItems={tableItems}
            generateId={generateId}
          />
        </div>
        
        <div className="text-sm text-gray-600 bg-white p-2 rounded border">
          Полигонов: {polygons.filter(p => p.closed).length} | 
          В процессе: {isDrawing ? '1' : '0'} | 
          Выбран: {selectedPolygon ? 'Да' : 'Нет'} |
          Размер: {canvasDimensions.width}×{canvasDimensions.height}
          {imageInfo && (
            <span className="ml-2 text-green-600">
              | Координаты относительные ✓
            </span>
          )}
        </div>
      </div>

      {/* Боковая панель со списком */}
      <ItemsPanel
        tableItems={tableItems}
        selectedPolygon={selectedPolygon}
        imageInfo={imageInfo}
        onLinkPolygonToItem={handleLinkPolygonToItem}
        onUnlinkItem={unlinkItem}
      />
    </div>
  );
};
