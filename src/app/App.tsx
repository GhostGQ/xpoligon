import React from 'react';
import cameraImageTest from '../shared/assets/camera-test.jpg';
import { PolygonEditorPage } from '../pages';

export interface AppProps {
  cameraId?: string;
  cameraImage?: string;
  initialData?: any;
}

const App: React.FC<AppProps> = ({ cameraImage = cameraImageTest }) => {
  return <PolygonEditorPage cameraImage={cameraImage} />;
};

export default App;
