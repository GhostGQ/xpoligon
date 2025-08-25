import React, { useState, useEffect } from 'react';
import { PolygonEditorPage } from '../pages';
import type { PolygonEditorData } from '../pages';
import { cameraApi } from '../shared/api';
import { Loading } from '../shared/ui';

export interface AppProps {
  cameraId?: string;
  cameraImage?: string;
  initialData?: any;
}

const App: React.FC<AppProps> = ({ cameraId = 'cam1' }) => {
  const [data, setData] = useState<PolygonEditorData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Параллельная загрузка данных
        const [camera, workplaces, polygons] = await Promise.all([
          cameraApi.getCameraById(cameraId),
          cameraApi.getWorkplacesByCamera(cameraId),
          cameraApi.getPolygonsByCamera(cameraId),
        ]);

        if (!camera) {
          throw new Error(`Камера с ID "${cameraId}" не найдена`);
        }

        setData({
          camera,
          workplaces,
          polygons,
        });
      } catch (err) {
        console.error('Ошибка загрузки данных:', err);
        setError(err instanceof Error ? err.message : 'Не удалось загрузить данные');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [cameraId]);

  const handleSave = async (saveData: any) => {
    console.log('Данные для сохранения:', saveData);
    try {
      const result = await cameraApi.savePolygonsForCamera(
        saveData.cameraId,
        saveData.regions.map((region: any) => ({
          id: region.id,
          points: region.relativeCoordinates,
          linkedWorkplace: region.linkedWorkplace,
          closed: region.closed,
        })),
        saveData.imageSize?.width,
        saveData.imageSize?.height
      );
      console.log('Сохранение завершено:', result);
    } catch (err) {
      console.error('Ошибка сохранения:', err);
    }
  };

  const handleChange = (polygons: any[]) => {
    console.log('Полигоны изменились:', polygons);
    // Обновляем локальное состояние если нужно
  };

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
    console.error('Ошибка в редакторе:', errorMessage);
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-red-50">
        <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-md">
          <h2 className="text-xl font-bold text-red-600 mb-2">Ошибка</h2>
          <p className="text-gray-700 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Перезагрузить
          </button>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loading />
      </div>
    );
  }

  return (
    <PolygonEditorPage
      data={data}
      loading={loading}
      onSave={handleSave}
      onChange={handleChange}
      onError={handleError}
      autoSaveDelay={1500}
    />
  );
};

export default App;
