import React, {useState, useEffect} from 'react';
import {useNavigate} from 'react-router-dom';
import type {PolygonEditorData} from 'xpoligon/dist/shared/types';
import cameraTestImage from '../assets/camera-test.jpg';

interface CameraData {
  id: string;
  name: string;
  screenshot: string;
  isActive: boolean;
  editorData: PolygonEditorData;
  lastModified?: string;
}

const CameraList: React.FC = () => {
  const navigate = useNavigate();
  const [cameras, setCameras] = useState<CameraData[]>([]);

  // Загружаем данные камер из localStorage
  useEffect(() => {
    const savedCameras = localStorage.getItem('xpoligon-cameras');
    if (savedCameras) {
      setCameras(JSON.parse(savedCameras));
    } else {
      // Создаем демо данные если их нет
      const demoCameras: CameraData[] = [
        {
          id: 'camera-1',
          name: 'Restaurant Hall Camera',
          screenshot: cameraTestImage,
          isActive: true,
          editorData: {
            camera: {
              id: 'camera-1',
              name: 'Restaurant Hall Camera',
              screenshot: cameraTestImage,
              isActive: true,
            },
            workplaces: [
              {
                id: 'wp1',
                name: 'Table #1',
                description: 'Window table for 2 people',
              },
              {
                id: 'wp2',
                name: 'Table #2',
                description: 'Corner table for 4 people',
              },
              {
                id: 'wp3',
                name: 'Table #3',
                description: 'Central table for 6 people',
              },
              {
                id: 'wp4',
                name: 'Table #4',
                description: 'Bar-side table for 2 people',
              },
              {
                id: 'wp5',
                name: 'Table #5',
                description: 'Private dining for 8 people',
              },
            ],
            polygons: [],
          },
        },
        {
          id: 'camera-2',
          name: 'Kitchen Overview Camera',
          screenshot: cameraTestImage,
          isActive: true,
          editorData: {
            camera: {
              id: 'camera-2',
              name: 'Kitchen Overview Camera',
              screenshot: cameraTestImage,
              isActive: true,
            },
            workplaces: [
              {
                id: 'kp1',
                name: 'Prep Station 1',
                description: 'Main preparation area',
              },
              {
                id: 'kp2',
                name: 'Prep Station 2',
                description: 'Secondary prep area',
              },
              {id: 'kp3', name: 'Stove Area', description: 'Cooking station'},
              {id: 'kp4', name: 'Dishwashing', description: 'Cleaning station'},
            ],
            polygons: [],
          },
        },
        {
          id: 'camera-3',
          name: 'Entrance Security Camera',
          screenshot: cameraTestImage,
          isActive: true,
          editorData: {
            camera: {
              id: 'camera-3',
              name: 'Entrance Security Camera',
              screenshot: cameraTestImage,
              isActive: true,
            },
            workplaces: [
              {
                id: 'ep1',
                name: 'Reception Desk',
                description: 'Main reception area',
              },
              {
                id: 'ep2',
                name: 'Waiting Area',
                description: 'Customer waiting zone',
              },
              {id: 'ep3', name: 'Entry Door', description: 'Main entrance'},
            ],
            polygons: [],
          },
        },
      ];
      setCameras(demoCameras);
      localStorage.setItem('xpoligon-cameras', JSON.stringify(demoCameras));
    }
  }, []);

  const handleEditCamera = (cameraId: string) => {
    navigate(`/editor/${cameraId}`);
  };

  const handleGoHome = () => {
    navigate('/');
  };

  const handleAddCamera = () => {
    const newCamera: CameraData = {
      id: `camera-${Date.now()}`,
      name: `New Camera ${cameras.length + 1}`,
      screenshot: cameraTestImage,
      isActive: true,
      editorData: {
        camera: {
          id: `camera-${Date.now()}`,
          name: `New Camera ${cameras.length + 1}`,
          screenshot: cameraTestImage,
          isActive: true,
        },
        workplaces: [],
        polygons: [],
      },
    };

    const updatedCameras = [...cameras, newCamera];
    setCameras(updatedCameras);
    localStorage.setItem('xpoligon-cameras', JSON.stringify(updatedCameras));
  };

  const handleDeleteCamera = (cameraId: string) => {
    if (confirm('Вы уверены, что хотите удалить эту камеру?')) {
      const updatedCameras = cameras.filter(c => c.id !== cameraId);
      setCameras(updatedCameras);
      localStorage.setItem('xpoligon-cameras', JSON.stringify(updatedCameras));
      localStorage.removeItem(`xpoligon-editor-${cameraId}`);
    }
  };

  return (
    <div className='min-h-screen h-full overflow-auto bg-gray-50'>
      <div className='container mx-auto px-4 py-8'>
        {/* Header */}
        <div className='flex flex-col sm:flex-row justify-between items-center mb-8'>
          <div className='flex items-center gap-4 mb-4 sm:mb-0'>
            <button
              onClick={handleGoHome}
              className='btn-ghost justify-self-start'
            >
              ← Главная
            </button>
            <div>
              <h1 className='text-2xl md:text-3xl font-bold text-gray-900'>
                📹 Камеры
              </h1>
              <p className='text-gray-600'>
                Управление камерами и редактирование полигонов
              </p>
            </div>
          </div>

          <button onClick={handleAddCamera} className='btn-primary'>
            + Добавить камеру
          </button>
        </div>

        {/* Cameras Grid */}
        {cameras.length > 0 ? (
          <div className='grid sm:grid-cols-2 lg:grid-cols-3 gap-6'>
            {cameras.map(camera => {
              const savedData = localStorage.getItem(
                `xpoligon-editor-${camera.id}`
              );
              const polygonCount = savedData
                ? JSON.parse(savedData).polygons?.length || 0
                : 0;

              return (
                <div key={camera.id} className='card card-hover'>
                  {/* Camera Image */}
                  <div className='relative aspect-video overflow-hidden'>
                    <img
                      src={camera.screenshot}
                      alt={camera.name}
                      className='w-full h-full object-cover'
                    />
                    <div className='absolute top-3 right-3'>
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          camera.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {camera.isActive ? '🟢 Активна' : '🔴 Неактивна'}
                      </span>
                    </div>
                  </div>

                  {/* Camera Info */}
                  <div className='p-4'>
                    <h3 className='text-lg font-semibold text-gray-900 mb-2'>
                      {camera.name}
                    </h3>

                    <div className='flex flex-wrap gap-2 mb-4'>
                      <span className='inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700'>
                        📐 {polygonCount} полигонов
                      </span>
                      <span className='inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-purple-50 text-purple-700'>
                        🏢 {camera.editorData.workplaces.length} мест
                      </span>
                    </div>

                    {camera.lastModified && (
                      <p className='text-xs text-gray-500 mb-4'>
                        Изменено:{' '}
                        {new Date(camera.lastModified).toLocaleString()}
                      </p>
                    )}

                    {/* Actions */}
                    <div className='flex gap-2'>
                      <button
                        onClick={() => handleEditCamera(camera.id)}
                        className='btn-primary text-sm flex-1'
                      >
                        ✏️ Редактировать
                      </button>
                      <button
                        onClick={() => handleDeleteCamera(camera.id)}
                        className='btn-secondary text-sm text-red-600 hover:text-red-700 hover:bg-red-50'
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className='text-center py-16'>
            <div className='text-6xl mb-4'>📷</div>
            <h3 className='text-xl font-semibold text-gray-900 mb-2'>
              Нет камер
            </h3>
            <p className='text-gray-600 mb-6'>
              Добавьте первую камеру для начала работы
            </p>
            <button onClick={handleAddCamera} className='btn-primary'>
              + Добавить камеру
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CameraList;
