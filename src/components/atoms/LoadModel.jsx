import React, { useState, useEffect } from 'react';
import * as tf from '@tensorflow/tfjs';

const ModelInput = ({ onModelLoaded }) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadModel = async () => {
            try {
                const model = await tf.loadLayersModel('/tfjs_model/model.json');
                onModelLoaded(model);
                setLoading(false);
            } catch (error) {
                console.error("Failed to load the model: ", error);
                setError(error);
                setLoading(false);
            }
        };

        loadModel();
    }, [onModelLoaded]);

    if (loading) return <p>Loading model...</p>;
    if (error) return <p>Error: {error.message}</p>;

    return null;
};

export default ModelInput;