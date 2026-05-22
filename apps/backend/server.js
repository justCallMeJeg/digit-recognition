const express = require('express');
const tf = require('@tensorflow/tfjs');
const cors = require('cors');
const multer = require('multer');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

app.use(cors());
app.use(express.json({ limit: '10mb' }));

let model;

async function loadModel() {
  try {
    // Build the architecture directly — avoids Keras 3 topology format issues
    model = tf.sequential({
      layers: [
        tf.layers.dense({ inputShape: [784], units: 128, activation: 'relu' }),
        tf.layers.dense({ units: 64, activation: 'relu' }),
        tf.layers.dense({ units: 10, activation: 'softmax' }),
      ]
    });

    // Load weights from binary file using specs from model.json
    const modelJson = JSON.parse(fs.readFileSync('./model/model.json', 'utf8'));
    const weightSpecs = modelJson.weightsManifest[0].weights;
    const weightsBuf = fs.readFileSync('./model/group1-shard1of1.bin');
    const weightData = weightsBuf.buffer.slice(
      weightsBuf.byteOffset,
      weightsBuf.byteOffset + weightsBuf.byteLength
    );

    const decoded = tf.io.decodeWeights(weightData, weightSpecs);
    model.setWeights(weightSpecs.map(spec => decoded[spec.name]));

    console.log('Model loaded successfully');
    console.log('Input shape:', model.inputs[0].shape);
    console.log('Output shape:', model.outputs[0].shape);
  } catch (error) {
    console.error('Failed to load model:', error);
    process.exit(1);
  }
}

// Preprocess image to match model input (784 = 28x28 flattened)
async function preprocessImage(imageBuffer) {
  // Convert image to 28x28 grayscale
  const processedImage = await sharp(imageBuffer)
    .resize(28, 28)
    .grayscale()
    .raw()
    .toBuffer();

  // Normalize pixel values to [0, 1]
  const pixels = new Float32Array(784);
  for (let i = 0; i < 784; i++) {
    pixels[i] = processedImage[i] / 255.0;
  }

  return pixels;
}

// Prediction endpoint for image upload
app.post('/predict/image', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image uploaded' });
    }

    const pixels = await preprocessImage(req.file.buffer);
    const inputTensor = tf.tensor2d([pixels], [1, 784]);
    
    const prediction = model.predict(inputTensor);
    const probabilities = await prediction.data();
    const predictedClass = prediction.argMax(-1).dataSync()[0];

    // Clean up tensors
    inputTensor.dispose();
    prediction.dispose();

    res.json({
      predictedClass,
      probabilities: Array.from(probabilities),
      confidence: probabilities[predictedClass]
    });
  } catch (error) {
    console.error('Prediction error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Prediction endpoint for canvas/raw data
app.post('/predict/raw', async (req, res) => {
  try {
    const { data } = req.body;
    
    if (!data || data.length !== 784) {
      return res.status(400).json({ 
        error: 'Invalid input: expected 784 values' 
      });
    }

    const inputTensor = tf.tensor2d([data], [1, 784]);
    const prediction = model.predict(inputTensor);
    const probabilities = await prediction.data();
    const predictedClass = prediction.argMax(-1).dataSync()[0];

    inputTensor.dispose();
    prediction.dispose();

    res.json({
      predictedClass,
      probabilities: Array.from(probabilities),
      confidence: probabilities[predictedClass]
    });
  } catch (error) {
    console.error('Prediction error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    modelLoaded: !!model 
  });
});

const PORT = process.env.PORT || 5000;

loadModel().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
});
