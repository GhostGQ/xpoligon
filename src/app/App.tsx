import React from 'react';
import { PolygonEditorPage } from '../pages';
import cameraImageTest from '../assets/camera-test.jpg';

export interface AppProps {
  cameraId?: string;
  cameraImage?: string;
  initialData?: any;
}

const App: React.FC<AppProps> = ({ 
  cameraId = 'camera-1', // Дефолтный ID для тестирования
  cameraImage = cameraImageTest,
  initialData 
}) => {
  return (
    <PolygonEditorPage 
      cameraId={cameraId}
      cameraImage={cameraImage} 
      initialData={initialData}
    />
  );
};

export default App;
