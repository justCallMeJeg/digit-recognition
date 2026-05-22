# 🎯 Quick Start Guide

## Your Model
- **Type:** Keras Sequential Model (Digit Recognition)
- **Input:** 784 features (28×28 grayscale image)
- **Output:** 10 classes (digits 0-9)
- **Size:** ~428 KB weights + 7.3 KB architecture

---

## 📦 What You Have

### ✅ Files Created for You:

**Backend (Express.js):**
- `server.js` - Main server with two endpoints
- `package.json` - Dependencies configuration
- `model/model.json` - Converted model architecture
- `model/group1-shard1of1.bin` - Model weights

**Frontend (React):**
- `client/src/App.js` - React component with canvas drawing
- `client/src/App.css` - Styling

**Utilities:**
- `convert_model.py` - Model conversion script
- `test_setup.py` - Verification tests
- `README.md` - Full documentation

---

## 🚀 Steps to Deploy Locally (5 minutes)

### 1️⃣ Setup Backend
```bash
# Install dependencies
npm install

# Start server
npm start
```
Server runs on **http://localhost:5000**

### 2️⃣ Setup Frontend
```bash
# In a new terminal
cd client

# If client folder doesn't exist yet:
npx create-react-app client
cd client

# Copy App.js and App.css to client/src/
# Then install and start:
npm install
npm start
```
App opens at **http://localhost:3000**

### 3️⃣ Test It!
- Draw a digit on the canvas
- Click "Predict"
- See the result!

---

## 🔌 API Endpoints

### Health Check
```bash
GET http://localhost:5000/health
```

### Predict from Canvas/Raw Data
```bash
POST http://localhost:5000/predict/raw
Content-Type: application/json

{
  "data": [0.0, 0.1, ..., 0.8]  // 784 float values
}
```

### Predict from Image Upload
```bash
POST http://localhost:5000/predict/image
Content-Type: multipart/form-data

image: <file>
```

---

## ☁️ Cloud Deployment (Choose One)

### Option A: Render (Easiest - Free Tier)
1. Push code to GitHub
2. Go to render.com
3. New → Web Service
4. Connect repo
5. Build: `npm install`
6. Start: `node server.js`
7. Done! You get a URL like: `your-app.onrender.com`

### Option B: Heroku
```bash
# Install Heroku CLI
heroku login
heroku create your-app-name
git push heroku main
```

### Option C: Vercel (Frontend) + Render (Backend)
**Render (Backend):** Same as Option A
**Vercel (Frontend):**
1. Go to vercel.com
2. Import project
3. Deploy!
4. Update API URL in App.js to point to Render backend

---

## 🧪 Testing

### Test Backend Works
```bash
curl http://localhost:5000/health
# Should return: {"status":"OK","modelLoaded":true}
```

### Test Prediction
```bash
curl -X POST http://localhost:5000/predict/raw \
  -H "Content-Type: application/json" \
  -d @test_input.json
```

---

## 📊 Expected Response Format

```json
{
  "predictedClass": 3,
  "probabilities": [
    0.001, 0.002, 0.003, 0.850, 0.020, ...
  ],
  "confidence": 0.850
}
```

---

## 🐛 Common Issues & Fixes

| Problem | Solution |
|---------|----------|
| Port 5000 already in use | Change PORT in server.js |
| CORS errors | Ensure backend has `cors` package |
| Module not found | Run `npm install` |
| Prediction always wrong | Check input normalization (0-1 range) |
| Canvas not drawing | Clear browser cache |
| Model not loading | Verify `model/` folder has both files |

---

## 🎨 Customization Ideas

- Change colors in App.css
- Add more digits/classes
- Save prediction history
- Add confidence threshold
- Export results as CSV
- Add dark mode
- Support multiple models
- Add authentication

---

## 📈 Performance Tips

### For Better Predictions:
- Draw clearly in the center
- Use thick strokes
- Fill the canvas area
- Upload 28×28 or square images

### For Faster Response:
- Use GPU-enabled TF.js (tfjs-node-gpu)
- Cache model in memory
- Add request queuing
- Implement batch prediction

---

## 🔧 Tech Stack Summary

| Layer | Technology |
|-------|------------|
| Model | Keras/TensorFlow → TF.js |
| Backend | Express.js + @tensorflow/tfjs-node |
| API | REST (JSON) |
| Frontend | React + HTML5 Canvas |
| Styling | CSS3 |
| Image Processing | Sharp (backend) |

---

## 📝 Next Steps Checklist

- [ ] Test locally (both servers running)
- [ ] Try drawing different digits
- [ ] Test image upload feature
- [ ] Choose deployment platform
- [ ] Deploy backend
- [ ] Deploy frontend
- [ ] Update API URL in frontend
- [ ] Test deployed app
- [ ] Share with friends! 🎉

---

## 🆘 Still Need Help?

1. Check the full README.md
2. Run `python3 test_setup.py` to verify setup
3. Check browser console for errors (F12)
4. Check server logs for backend errors
5. Ensure both servers are running

---

## 🎓 What You Learned

✅ Converting Keras models to TensorFlow.js
✅ Building REST APIs with Express
✅ Creating React apps with Canvas
✅ Handling image preprocessing
✅ Model inference in Node.js
✅ Full-stack deployment

---

**You're ready to deploy! Good luck! 🚀**
