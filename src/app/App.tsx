import React from 'react';
import { PolygonEditorPage } from '../pages';

export interface AppProps {
  cameraId?: string;
  cameraImage?: string;
  initialData?: any;
}

const App: React.FC<AppProps> = ({ cameraId = 'cam1' }) => {
  return <PolygonEditorPage cameraId={cameraId} />;
};

export default App;
