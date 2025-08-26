import {BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import WelcomePage from './components/WelcomePageNew';
import CameraList from './components/CameraListNew';
import PolygonEditor from './components/PolygonEditorNew';
import './index.css';

function App() {
  return (
    <Router basename='/xpoligon'>
      <div className='min-h-screen h-full bg-gray-50'>
        <Routes>
          <Route path='/' element={<WelcomePage />} />
          <Route path='/cameras' element={<CameraList />} />
          <Route path='/editor/:cameraId' element={<PolygonEditor />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
