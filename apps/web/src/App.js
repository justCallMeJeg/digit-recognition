import React, { useRef, useState, useEffect } from 'react';
import './App.css';

function App() {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [brushSize, setBrushSize] = useState(15);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  const startDrawing = (e) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.strokeStyle = 'black';
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setPrediction(null);
  };

  const preprocessCanvas = () => {
    const canvas = canvasRef.current;

    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = 28;
    tempCanvas.height = 28;
    const tempCtx = tempCanvas.getContext('2d');

    tempCtx.drawImage(canvas, 0, 0, 28, 28);

    const imageData = tempCtx.getImageData(0, 0, 28, 28);
    const pixels = new Float32Array(784);

    for (let i = 0; i < 784; i++) {
      const idx = i * 4;
      // Invert: white background -> 0, black drawing -> 1
      const gray = 255 - imageData.data[idx];
      pixels[i] = gray / 255.0;
    }

    return Array.from(pixels);
  };

  const handlePredict = async () => {
    setLoading(true);
    try {
      const pixelData = preprocessCanvas();

      const response = await fetch('http://localhost:5000/predict/raw', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data: pixelData }),
      });

      const result = await response.json();
      setPrediction(result);
    } catch (error) {
      console.error('Prediction failed:', error);
      alert('Failed to get prediction. Make sure the server is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch('http://localhost:5000/predict/image', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      setPrediction(result);

      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      };
      img.src = URL.createObjectURL(file);
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Failed to upload image.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <header>
        <h1>Digit Recognition Demo</h1>
        <p>Draw a digit (0-9) or upload an image</p>
      </header>

      <div className="container">
        <div className="canvas-container">
          <canvas
            ref={canvasRef}
            width={280}
            height={280}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
          />

          <div className="brush-control">
            <label htmlFor="brushSize">Brush</label>
            <input
              id="brushSize"
              type="range"
              min="4"
              max="40"
              value={brushSize}
              onChange={(e) => setBrushSize(Number(e.target.value))}
            />
            <span className="brush-size-value">{brushSize}px</span>
          </div>

          <div className="controls">
            <button onClick={handlePredict} disabled={loading}>
              {loading ? 'Predicting...' : 'Predict'}
            </button>
            <button onClick={clearCanvas}>Clear</button>
            <label className="upload-btn">
              Upload
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
              />
            </label>
          </div>
        </div>

        {prediction && (
          <div className="results">
            <h2>Prediction Results</h2>
            <div className="prediction-main">
              <div className="predicted-digit">{prediction.predictedClass}</div>
              <div className="confidence">
                Confidence: {(prediction.confidence * 100).toFixed(2)}%
              </div>
            </div>

            <div className="probabilities">
              <h3>All Probabilities:</h3>
              {[...prediction.probabilities.map((prob, idx) => ({ digit: idx, prob }))]
                .sort((a, b) => b.prob - a.prob)
                .map(({ digit, prob }) => (
                <div key={digit} className="prob-bar">
                  <span className="digit-label">{digit}</span>
                  <div className="bar-container">
                    <div
                      className="bar-fill"
                      style={{ width: `${prob * 100}%` }}
                    />
                  </div>
                  <span className="prob-value">{(prob * 100).toFixed(1)}%</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
