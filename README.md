# 🚀 Keras Model Web App - Setup Guide

Complete guide to deploy your Keras digit recognition model with Express.js backend and React frontend.

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Python 3 (for model conversion)

---

## 🏗️ Project Structure

```
keras-model-app/
├── server.js              # Express backend
├── package.json           # Backend dependencies
├── model/                 # Converted TensorFlow.js model
│   ├── model.json
│   └── group1-shard1of1.bin
└── client/                # React frontend
    ├── src/
    │   ├── App.js
    │   └── App.css
    └── package.json
```

---

## 🔧 Setup Instructions

### Step 1: Convert Your Keras Model

First, convert your `.keras` file to TensorFlow.js format:

```bash
# Run the conversion script
python3 convert_model.py
```

This creates:
- `model/model.json` - Model architecture
- `model/group1-shard1of1.bin` - Model weights

### Step 2: Backend Setup

```bash
# Install backend dependencies
npm install

# Start the server
npm start

# Or for development with auto-reload
npm run dev
```

The server will start on **http://localhost:5000**

**API Endpoints:**
- `POST /predict/raw` - For canvas drawings (expects 784 float array)
- `POST /predict/image` - For image uploads
- `GET /health` - Health check

### Step 3: Frontend Setup

```bash
# Navigate to client directory
cd client

# Install dependencies
npm install

# Start React dev server
npm start
```

The app will open at **http://localhost:3000**

---

## 🎯 How to Use the App

### Drawing Mode
1. Draw a digit (0-9) on the canvas using your mouse
2. Click "🔮 Predict" to get the model's prediction
3. View the predicted digit and confidence scores
4. Click "🗑️ Clear" to start over

### Upload Mode
1. Click "📁 Upload" to select an image file
2. The model will automatically predict
3. The uploaded image will be displayed on the canvas

---

## 📦 Deployment

### Local Deployment

Already done! Just run both servers:
```bash
# Terminal 1 - Backend
npm start

# Terminal 2 - Frontend
cd client && npm start
```

### Cloud Deployment Options

#### Option 1: Heroku (Backend + Frontend)

**Backend:**
```bash
# Add Procfile
echo "web: node server.js" > Procfile

# Deploy
heroku create your-app-name
git push heroku main
```

**Frontend:**
Update API URL in `client/src/App.js`:
```javascript
const API_URL = 'https://your-app-name.herokuapp.com';
```

#### Option 2: Vercel (Frontend) + Render (Backend)

**Backend on Render:**
1. Create account at render.com
2. Create new Web Service
3. Connect your GitHub repo
4. Build command: `npm install`
5. Start command: `node server.js`

**Frontend on Vercel:**
1. Create account at vercel.com
2. Import your project
3. Set environment variable:
   - `REACT_APP_API_URL=https://your-backend.onrender.com`
4. Update fetch URLs to use `process.env.REACT_APP_API_URL`

#### Option 3: AWS (EC2)

```bash
# SSH into EC2 instance
ssh -i your-key.pem ubuntu@your-ip

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Clone your repo
git clone your-repo-url
cd your-repo

# Backend
npm install
npm install -g pm2
pm2 start server.js
pm2 save

# Frontend (build for production)
cd client
npm install
npm run build
sudo npm install -g serve
serve -s build -p 80
```

#### Option 4: Docker

```dockerfile
# Dockerfile for backend
FROM node:18
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 5000
CMD ["node", "server.js"]
```

```bash
# Build and run
docker build -t keras-model-backend .
docker run -p 5000:5000 keras-model-backend
```

---

## 🔍 Testing the API

### Using cURL

**Test raw prediction:**
```bash
curl -X POST http://localhost:5000/predict/raw \
  -H "Content-Type: application/json" \
  -d '{"data": [0.0, 0.0, ..., 0.5, 0.8, ...]}'
```

**Test image upload:**
```bash
curl -X POST http://localhost:5000/predict/image \
  -F "image=@digit.png"
```

**Health check:**
```bash
curl http://localhost:5000/health
```

---

## 🐛 Troubleshooting

### Model not loading
- Ensure `model/model.json` exists
- Check file path in `server.js`
- Verify model conversion completed successfully

### CORS errors
- Ensure `cors` is installed and enabled
- Check frontend is making requests to correct URL

### Prediction errors
- Verify input data is exactly 784 values
- Check normalization (values should be 0-1)
- Ensure data type is Float32Array or regular array

### Canvas not working
- Check browser console for errors
- Verify React app is running on port 3000
- Test in different browser

---

## 📊 Model Details

- **Input:** 784 features (28×28 grayscale image, flattened)
- **Output:** 10 classes (digits 0-9)
- **Architecture:** 
  - Dense(128) → Dense(64) → Dense(10)
- **Total Parameters:** 328,160
- **Model Size:** ~1.25 MB

---

## 🎨 Customization

### Change Canvas Size
In `client/src/App.js`:
```javascript
<canvas
  width={400}  // Change from 280
  height={400} // Change from 280
/>
```

### Modify Styling
Edit `client/src/App.css` for custom colors, layout, etc.

### Add More Features
- Image preprocessing options
- Batch prediction
- Model performance metrics
- Download prediction results

---

## 📚 Tech Stack

- **Backend:** Express.js, TensorFlow.js Node, Multer, Sharp
- **Frontend:** React, HTML5 Canvas
- **Model:** Keras/TensorFlow (converted to TF.js)

---

## 🤝 Next Steps

1. ✅ Test locally
2. ✅ Deploy to cloud
3. Add authentication (if needed)
4. Implement rate limiting
5. Add analytics/logging
6. Create API documentation
7. Add unit tests

---

## 📝 Notes

- This is a demo application - not production-ready
- Consider adding input validation
- Implement proper error handling for production
- Add monitoring and logging
- Consider model versioning

---

## 🆘 Need Help?

Common issues and solutions:

1. **Port already in use:** Change port in `server.js` and update frontend URL
2. **Module not found:** Run `npm install` again
3. **Model prediction wrong:** Check input preprocessing matches training data
4. **Slow predictions:** Consider using GPU-enabled TensorFlow.js for better performance

---

Happy coding! 🎉
