import React, {useState, useEffect} from 'react';
import type {Polygon} from '../../entities/polygon';
import {
  generateId,
  useImageProcessing,
  useCanvasDimensions,
  useCameraData,
  useAutoSave,
} from '../../shared/lib';
import {usePolygonLinking} from '../../features/polygon-linking';
import {PolygonCanvas} from '../../widgets/polygon-canvas';
import {ItemsPanel} from '../../widgets/items-panel';
import {Button, Loading} from '../../shared/ui';

interface PolygonEditorPageProps {
  cameraId: string;
}

export const PolygonEditorPage: React.FC<PolygonEditorPageProps> = ({
  cameraId,
}) => {
  const canvasDimensions = useCanvasDimensions();

  // Загружаем данные камеры
  const {
    camera,
    workplaces,
    polygons: initialPolygons,
    loading,
    error,
    savePolygons,
  } = useCameraData({cameraId});

  const {backgroundImage, imageInfo} = useImageProcessing({
    cameraImage: camera?.screenshot,
    canvasDimensions,
  });

  const [polygons, setPolygons] = useState<Polygon[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [selectedPolygon, setSelectedPolygon] = useState<string | null>(null);

  // Автосохранение полигонов
  useAutoSave({
    polygons,
    cameraId,
    savePolygons,
    imageWidth: imageInfo?.width,
    imageHeight: imageInfo?.height,
    delay: 1000,
  });

  // Инициализируем полигоны при загрузке данных
  useEffect(() => {
    if (initialPolygons.length > 0) {
      setPolygons(initialPolygons);
    }
  }, [initialPolygons]);

  const {linkPolygonToItem, unlinkItem} = usePolygonLinking({
    polygons,
    workplaces,
    setPolygons,
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
    const updatedPolygons = polygons.filter(p => p.id !== polygonId);
    setPolygons(updatedPolygons);
    setSelectedPolygon(null);

    // Автосохранение сработает автоматически через useAutoSave
  };

  const clearAll = () => {
    setPolygons([]);
    setIsDrawing(false);
    setSelectedPolygon(null);

    // Автосохранение сработает автоматически через useAutoSave
  };

  const handleLinkPolygonToItem = (workplaceId: string) => {
    if (selectedPolygon) {
      linkPolygonToItem(selectedPolygon, workplaceId);
    }
  };

  const handleSavePolygons = () => {
    // Ручное сохранение (автосохранение и так работает)
    console.log('Полигоны сохранены вручную для камеры:', cameraId);
  };

  if (loading) {
    return (
      <div className='flex gap-4 p-4 h-screen overflow-hidden'>
        <div className='flex flex-col gap-4 flex-1'>
          <div className='bg-gray-100 p-3 rounded-lg'>
            <h2 className='text-lg font-bold mb-1'>Загрузка камеры...</h2>
            <div className='text-sm text-gray-600'>
              Получение данных с сервера
            </div>
          </div>
          <div className='border-2 border-gray-300 rounded-lg overflow-hidden flex-1 flex items-center justify-center'>
            <Loading message='Загрузка изображения камеры...' />
          </div>
        </div>
        <div className='w-80 bg-gray-50 p-4 rounded-lg flex flex-col'>
          <h3 className='text-lg font-bold mb-4'>Рабочие места</h3>
          <div className='flex-1 flex items-center justify-center'>
            <Loading message='Загрузка списка...' />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='flex items-center justify-center h-screen'>
        <div className='text-lg text-red-600'>Ошибка: {error}</div>
      </div>
    );
  }

  if (!camera) {
    return (
      <div className='flex items-center justify-center h-screen'>
        <div className='text-lg'>Камера не найдена</div>
      </div>
    );
  }

  return (
    <div className='flex gap-4 p-4 h-screen overflow-hidden'>
      {/* Основная область с canvas */}
      <div className='flex flex-col gap-4 flex-1'>
        <div className='bg-gray-100 p-3 rounded-lg flex justify-between items-center'>
          <div>
            <h2 className='text-lg font-bold mb-1'>{camera.name}</h2>
            <div className='text-sm text-gray-600'>
              {backgroundImage
                ? `Загружено изображение ${imageInfo?.width}×${imageInfo?.height}px`
                : 'Режим сетки (нет изображения)'}
              {imageInfo && (
                <span className='ml-2 text-blue-600'>
                  Масштаб: {(imageInfo.scale * 100).toFixed(1)}%
                </span>
              )}
            </div>
          </div>
          <div className='flex gap-2'>
            <Button
              onClick={handleSavePolygons}
              variant='primary'
              disabled={polygons.length === 0}
            >
              Сохранить полигоны
            </Button>
            {selectedPolygon && (
              <Button
                onClick={() => deletePolygon(selectedPolygon)}
                variant='warning'
                title='Delete/Backspace'
              >
                Удалить выбранный
              </Button>
            )}
            <Button onClick={clearAll} variant='danger'>
              Очистить все
            </Button>
          </div>
        </div>

        <div className='border-2 border-gray-300 rounded-lg overflow-hidden flex-1'>
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
            workplaces={workplaces}
            generateId={generateId}
            cameraId={cameraId}
          />
        </div>

        <div className='text-sm text-gray-600 bg-white p-2 rounded border'>
          Полигонов: {polygons.filter(p => p.closed).length} | В процессе:{' '}
          {isDrawing ? '1' : '0'} | Выбран: {selectedPolygon ? 'Да' : 'Нет'} |
          Размер: {canvasDimensions.width}×{canvasDimensions.height}
          {imageInfo && (
            <span className='ml-2 text-green-600'>
              | Координаты относительные ✓
            </span>
          )}
        </div>
      </div>

      {/* Боковая панель со списком */}
      <ItemsPanel
        workplaces={workplaces}
        polygons={polygons}
        selectedPolygon={selectedPolygon}
        imageInfo={imageInfo}
        onLinkPolygonToItem={handleLinkPolygonToItem}
        onUnlinkItem={unlinkItem}
      />
    </div>
  );
};
