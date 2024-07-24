import React, { useState, useEffect, useRef } from 'react';
import Button from './atoms/Button';
import * as tf from '@tensorflow/tfjs';
import { classLabels } from './atoms/ClassLabels';
import { saran } from './atoms/Saran';
import LoadModel from './atoms/LoadModel';

const InputCapture = () => {
    const [model, setModel] = useState(null);
    const [prediction, setPrediction] = useState(null);
    const [imageSrc, setImageSrc] = useState(null);
    const [predictClicked, setPredictClicked] = useState(false);
    const canvasRef = useRef(null);

    useEffect(() => {
        if (predictClicked && imageSrc) {
            const image = new Image();
            image.src = imageSrc;
            image.onload = async () => {
                const canvas = canvasRef.current;
                const context = canvas.getContext('2d');
                canvas.width = image.width;
                canvas.height = image.height;
                context.drawImage(image, 0, 0);

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
        }
    }, [predictClicked, imageSrc, model]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onloadend = () => {
            setImageSrc(reader.result);
        };
        if (file) {
            reader.readAsDataURL(file);
        }
    };

    const handlePredict = () => {
        setPredictClicked(true);
    };

    return (
        <div className="model-container">
            <LoadModel onModelLoaded={setModel} />
            <h1 className="header">Upload Image</h1>
            <input type="file" accept="image/*" onChange={handleFileChange} />
            <Button text="Predict" onClick={handlePredict} className="button" />
            <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>
            {imageSrc && <img src={imageSrc} alt="Uploaded" style={{ width: '50%', height: 'auto', borderRadius: '10px' }} />}
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

export default InputCapture;
