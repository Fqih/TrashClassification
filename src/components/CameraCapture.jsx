import React, { useState, useEffect, useRef } from 'react';
import * as tf from '@tensorflow/tfjs';
import Button from './atoms/Button';
import { classLabels } from './atoms/ClassLabels'; 
import { saran } from './atoms/Saran';
import LoadModel from './atoms/LoadModel';

const CameraCapture = () => {
    const [model, setModel] = useState(null);
    const [prediction, setPrediction] = useState(null);
    const [cameras, setCameras] = useState([]);
    const [selectedCamera, setSelectedCamera] = useState(null);
    const videoRef = useRef(null);
    const canvasRef = useRef(null);

    useEffect(() => {
        const startCamera = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ 
                    video: { deviceId: selectedCamera ? { exact: selectedCamera } : undefined } 
                });
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    videoRef.current.onloadedmetadata = () => {
                        videoRef.current.play();
                    };
                }
            } catch (error) {
                console.error("Error accessing the camera: ", error);
            }
        };

        startCamera();

        return () => {
            if (videoRef.current && videoRef.current.srcObject) {
                const stream = videoRef.current.srcObject;
                const tracks = stream.getTracks();
                tracks.forEach(track => track.stop());
            }
        };
    }, [selectedCamera]);

    useEffect(() => {
        const getCameras = async () => {
            try {
                const devices = await navigator.mediaDevices.enumerateDevices();
                const videoDevices = devices.filter(device => device.kind === 'videoinput');
                setCameras(videoDevices);
                if (videoDevices.length > 0) {
                    setSelectedCamera(videoDevices[0].deviceId);
                }
            } catch (error) {
                console.error("Error enumerating devices: ", error);
            }
        };

        getCameras();
    }, []);

    const handleCapture = async () => {
        if (!model || !videoRef.current) return;

        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);

        const tensor = tf.browser.fromPixels(canvas)
            .resizeNearestNeighbor([150, 150])
            .toFloat()
            .div(tf.scalar(255.0))
            .expandDims();

        const prediction = await model.predict(tensor).data();
        const maxIndex = prediction.indexOf(Math.max(...prediction));
        const maxProbability = prediction[maxIndex];

        if (maxProbability < 0.55) {
            setPrediction({
                label: "Gambar tidak dikenali",
                probability: maxProbability,
                suggestion: "Harap gunakan gambar yang lebih jelas."
            });
        } else {
            setPrediction({
                label: classLabels[maxIndex],
                probability: maxProbability,
                suggestion: saran[classLabels[maxIndex]]
            });
        }
    };

    return (
        <div className="model-container">
            <h1 className="header">Camera Capture</h1>
            <LoadModel onModelLoaded={setModel} />
            
            {cameras.length > 0 && (
                <div className="camera-selection">
                    <label htmlFor="camera-select">Select Camera: </label>
                    <select
                        id="camera-select"
                        value={selectedCamera}
                        onChange={(e) => setSelectedCamera(e.target.value)}
                    >
                        {cameras.map(camera => (
                            <option key={camera.deviceId} value={camera.deviceId}>
                                {camera.label || `Camera ${camera.deviceId}`}
                            </option>
                        ))}
                    </select>
                </div>
            )}
            
            <video ref={videoRef} style={{ width: '50%', height: 'auto', borderRadius: '10px' }}></video>
            <Button text="Capture" onClick={handleCapture} className="button" />
            <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>
            {prediction && (
                <div className="prediction-container">
                    <h2 className="prediction-header">Prediction:</h2>
                    <p className="prediction-item">{`${prediction.label}: ${prediction.probability.toFixed(3)}`}</p>
                    <h3 className="suggestion-header">Saran</h3>
                    <p className="suggestion-item">{prediction.suggestion}</p>
                </div>
            )}
        </div>
    );
};

export default CameraCapture;
