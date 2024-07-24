import React, { useState } from 'react';
import './App.css';
import CameraCapture from './components/CameraCapture.jsx';
import InputCapture from './components/InputCapture.jsx';
import Button from './components/atoms/Button.jsx';

function App() {
  const [showCamera, setShowCamera] = useState(true);
  const [showInput, setShowInput] = useState(false);

  const handleShowCamera = () => {
    setShowCamera(true);
    setShowInput(false);
  };

  const handleShowInput = () => {
    setShowCamera(false);
    setShowInput(true);
  };

  return (
    <div className="App">
      <div className="button-container">
        <Button text="Use Camera" onClick={handleShowCamera} className="button" />
        <Button text="Upload Image" onClick={handleShowInput} className="button" />
      </div>
      {showCamera && <CameraCapture />}
      {showInput && <InputCapture />}
    </div>
  );
}

export default App;