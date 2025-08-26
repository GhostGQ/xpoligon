import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PolygonEditorPage } from 'xpoligon';
import 'xpoligon/dist/index.css';
import type {
  PolygonEditorData,
  PolygonEditorSaveData,
} from 'xpoligon/dist/shared/types';

interface CameraData {
  id: string;
  name: string;
  screenshot: string;
  isActive: boolean;
  editorData: PolygonEditorData;
  lastModified?: string;
}

const PolygonEditor: React.FC = () => {
  const { cameraId } = useParams<{ cameraId: string }>();
  const navigate = useNavigate();
  const [camera, setCamera] = useState<CameraData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!cameraId) {
      navigate('/cameras');
      return;
    }

    const savedCameras = localStorage.getItem('xpoligon-cameras');
    if (savedCameras) {
      const cameras: CameraData[] = JSON.parse(savedCameras);
      const foundCamera = cameras.find(c => c.id === cameraId);
      
      if (foundCamera) {
        setCamera(foundCamera);
      } else {
        console.error('Camera not found:', cameraId);
        navigate('/cameras');
      }
    } else {
      navigate('/cameras');
    }
  }, [cameraId]);

  const showNotification = (
    message: string,
    type: 'success' | 'error' = 'success'
  ) => {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => notification.classList.add('show'), 10);

    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => {
        if (document.body.contains(notification)) {
          document.body.removeChild(notification);
        }
      }, 300);
    }, 3000);
  };

  const handleSave = (data: PolygonEditorSaveData) => {
    console.log('💾 Save data:', data);
    
    if (camera) {
      const savedCameras = localStorage.getItem('xpoligon-cameras');
      if (savedCameras) {
        const cameras: CameraData[] = JSON.parse(savedCameras);
        const updatedCameras = cameras.map(c => 
          c.id === camera.id 
            ? { ...c, lastModified: new Date().toISOString() }
            : c
        );
        localStorage.setItem('xpoligon-cameras', JSON.stringify(updatedCameras));
      }
    }

    showNotification(
      `✅ Сохранено ${data.regions.length} полигонов`
    );
  };

  const handleChange = (polygons: any[]) => {
    console.log('🔄 Polygons changed:', polygons.length, 'total');
  };

  const handleError = (error: string) => {
    console.error('❌ Error:', error);
    showNotification(`❌ Ошибка: ${error}`, 'error');
  };

  if (!camera) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">🔄</div>
          <p className="text-gray-600">Загрузка данных камеры...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-white overflow-hidden">
      <PolygonEditorPage
        data={camera.editorData}
        loading={loading}
        onSave={handleSave}
        onChange={handleChange}
        onError={handleError}
        enableLocalStorage={true}
        localStorageKey={`xpoligon-editor-${camera.id}`}
        autoSaveDelay={1000}
        localStorageDelay={500}
      />
    </div>
  );
};

export default PolygonEditor;
