import React, {useState, useEffect} from 'react';
import type {Dimensions} from '../../shared/types';
import {CANVAS_CONFIG} from '../../shared/config';
import {Button, SaveStatus} from '../../shared/ui';
import {PolygonSaving} from '../../features/polygon-saving';
import PolygonCanvas from './PolygonCanvas';

export interface PolygonEditorWidgetProps {
  cameraId: string;
  cameraImage?: string;
  polygons: any[];
  isDrawing: boolean;
  selectedPolygon: string | null;
  tableItems: any[];
  mousePos: {x: number; y: number};
  lastSaved: string | null;
  isLoading?: boolean;
  onMouseDown: (e: React.MouseEvent) => void;
  onMouseMove: (e: React.MouseEvent) => void;
  onMouseUp: (e: React.MouseEvent) => void;
  onContextMenu: (e: React.MouseEvent) => void;
  onDeleteSelected: () => void;
  onClearAll: () => void;
  onClearStorage?: () => void;
}

const PolygonEditorWidget: React.FC<PolygonEditorWidgetProps> = ({
  cameraId,
  cameraImage,
  polygons,
  isDrawing,
  selectedPolygon,
  tableItems,
  mousePos,
  lastSaved,
  isLoading = false,
  onMouseDown,
  onMouseMove,
  onMouseUp,
  onContextMenu,
  onDeleteSelected,
  onClearAll,
  onClearStorage,
}) => {
  const [canvasDimensions, setCanvasDimensions] = useState<Dimensions>({
    width: 800,
    height: 600,
  });
  const [backgroundImage, setBackgroundImage] =
    useState<HTMLImageElement | null>(null);

  // Обработка изменения размеров окна
  useEffect(() => {
    const updateCanvasSize = () => {
      const availableWidth =
        window.innerWidth - CANVAS_CONFIG.SIDEBAR_WIDTH - CANVAS_CONFIG.PADDING;
      const availableHeight = window.innerHeight - CANVAS_CONFIG.HEADER_HEIGHT;

      setCanvasDimensions({
        width: Math.max(CANVAS_CONFIG.MIN_WIDTH, availableWidth),
        height: Math.max(CANVAS_CONFIG.MIN_HEIGHT, availableHeight),
      });
    };

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);
    return () => window.removeEventListener('resize', updateCanvasSize);
  }, []);

  // Загрузка фонового изображения
  useEffect(() => {
    if (cameraImage) {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = canvasDimensions.width;
        canvas.height = canvasDimensions.height;
        const ctx = canvas.getContext('2d');

        if (ctx) {
          const scaleX = canvasDimensions.width / img.width;
          const scaleY = canvasDimensions.height / img.height;
          const scale = Math.min(scaleX, scaleY);

          const scaledWidth = img.width * scale;
          const scaledHeight = img.height * scale;
          const offsetX = (canvasDimensions.width - scaledWidth) / 2;
          const offsetY = (canvasDimensions.height - scaledHeight) / 2;

          ctx.fillStyle = '#f0f0f0';
          ctx.fillRect(0, 0, canvasDimensions.width, canvasDimensions.height);
          ctx.drawImage(img, offsetX, offsetY, scaledWidth, scaledHeight);
        }

        const processedImg = new window.Image();
        processedImg.src = canvas.toDataURL();
        processedImg.onload = () => setBackgroundImage(processedImg);
      };
      img.src = cameraImage;
    } else {
      setBackgroundImage(null);
    }
  }, [cameraImage, canvasDimensions]);

  return (
    <div className='flex flex-col gap-4 flex-1'>
      <div className='bg-gray-100 p-3 rounded-lg flex justify-between items-center'>
        <div>
          <h2 className='text-lg font-bold mb-1'>Редактор полигонов</h2>
          <div className='text-sm text-gray-600'>
            {backgroundImage
              ? 'Загружено изображение камеры'
              : 'Режим сетки (нет изображения)'}
          </div>
          <SaveStatus
            cameraId={cameraId}
            lastSaved={lastSaved}
            isLoading={isLoading}
          />
        </div>
        <div className='flex gap-2'>
          <PolygonSaving polygons={polygons} tableItems={tableItems} />
          {selectedPolygon && (
            <Button
              onClick={onDeleteSelected}
              variant='warning'
              title='Delete/Backspace'
            >
              Удалить выбранный
            </Button>
          )}
          <Button onClick={onClearAll} variant='danger'>
            Очистить все
          </Button>
          {onClearStorage && (
            <Button
              onClick={onClearStorage}
              variant='secondary'
              size='sm'
              title='Очистить сохраненные данные'
            >
              🗑️ Очистить кэш
            </Button>
          )}
        </div>
      </div>

      <div className='border-2 border-gray-300 rounded-lg overflow-hidden flex-1'>
        <PolygonCanvas
          dimensions={canvasDimensions}
          backgroundImage={backgroundImage}
          polygons={polygons}
          isDrawing={isDrawing}
          selectedPolygon={selectedPolygon}
          tableItems={tableItems}
          mousePos={mousePos}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onContextMenu={onContextMenu}
        />
      </div>

      <div className='text-sm text-gray-600 bg-white p-2 rounded border'>
        Полигонов: {polygons.filter(p => p.closed).length} | В процессе:{' '}
        {isDrawing ? '1' : '0'} | Выбран: {selectedPolygon ? 'Да' : 'Нет'} |
        Размер: {canvasDimensions.width}×{canvasDimensions.height}
      </div>
    </div>
  );
};

export default PolygonEditorWidget;
