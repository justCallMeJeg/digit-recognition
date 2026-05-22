# Digit Recognizer

A full-stack handwritten digit recognition app built on a Keras MNIST model. Draw a digit in the browser and the model classifies it in real time, returning a ranked probability list for all 10 classes.

---

## Features

- **Draw-to-predict** — freehand canvas with auto-centering and bounding-box preprocessing before inference
- **Ranked results** — all 10 digit classes sorted by probability with animated bars
- **28×28 preview** — shows the exact tensor sent to the model
- **Fast inference** — dense neural network runs in milliseconds via TensorFlow.js on Node.js

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, TypeScript, Vite, TailwindCSS v4, shadcn/ui |
| Backend | Node.js, Express, TensorFlow.js |
| Model | Keras Sequential (Dense 784→128→64→10) trained on MNIST |
| Monorepo | Turborepo, npm workspaces |

---

## Project Structure

```
digit-recognition/
├── apps/
│   ├── backend/          # Express API + TensorFlow.js inference
│   │   ├── model/        # Converted TF.js model weights
│   │   └── server.js
│   └── web/              # React + Vite frontend
│       └── src/
│           ├── components/
│           └── App.tsx
├── scripts/
│   ├── convert_model.py  # Keras → TF.js weight converter
│   └── test_setup.py     # Verify model files and backend setup
├── model.keras           # Original Keras model
└── turbo.json
```

---

## Prerequisites

- **Node.js** v18 or higher
- **npm** v9 or higher
- **Python 3.9+** with `tensorflow` and `numpy` *(only needed to re-convert the model)*

---

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

```bash
# apps/web/.env  (already included — change if your backend runs on a different port)
VITE_API_URL=http://localhost:5000
```

### 3. Run in development

```bash
npm run dev
```

Starts both servers concurrently via Turbo:

| Service | URL |
|---|---|
| Frontend (Vite) | http://localhost:5173 |
| Backend (Express) | http://localhost:5000 |

### 4. Production build

```bash
npm run build   # compiles frontend to apps/web/dist
npm run start   # serves built frontend + backend
```

---

## API Reference

### `GET /health`

Returns model load status.

```json
{ "status": "ok", "modelLoaded": true }
```

### `POST /predict/raw`

Accepts a flat array of 784 normalized float values (grayscale pixels, 0.0–1.0, black background).

**Request**
```json
{ "data": [0.0, 0.0, 0.95, ...] }
```

**Response**
```json
{
  "predictedClass": 7,
  "confidence": 0.982,
  "probabilities": [0.001, 0.003, 0.002, 0.001, 0.002, 0.001, 0.001, 0.982, 0.004, 0.003]
}
```

### `POST /predict/image`

Accepts a multipart form upload (`image` field). The backend resizes and normalizes the image automatically.

---

## Model Architecture

```
Input  →  Dense(128, relu)  →  Dense(64, relu)  →  Dense(10, softmax)
 784            128                  64                    10
```

Trained on the MNIST dataset (60,000 training / 10,000 test images).

### Re-converting the model

If you update `model.keras`, regenerate the TF.js weights:

```bash
cd scripts
pip install tensorflow numpy
python convert_model.py
# outputs to apps/backend/model/
```

---

## Pre-Publish Checklist

### Security
- [ ] `apps/web/.env` is listed in `.gitignore` — confirm it is **not** committed
- [ ] No hardcoded secrets, API keys, or credentials in source files
- [ ] Backend CORS origin locked to the production frontend URL (not `*`)
- [ ] Add rate limiting to `/predict/*` endpoints (e.g. `express-rate-limit`)
- [ ] Review all `console.log` / debug output and remove or gate behind `NODE_ENV`

### Code Quality
- [ ] TypeScript compiles with no errors: `cd apps/web && npx tsc --noEmit`
- [ ] No ESLint warnings: `cd apps/web && npx eslint src`
- [ ] `BrushSlider.tsx` removed or cleaned up (currently unused)
- [ ] `apps/web/src/App.css` removed if empty/unused

### Build & Runtime
- [ ] Production build succeeds: `npm run build`
- [ ] `apps/web/dist/` is in `.gitignore`
- [ ] Backend starts cleanly and `/health` returns `{ modelLoaded: true }`
- [ ] Model binary files (`model.json`, `*.bin`) are committed to the repo

### Frontend Polish
- [ ] Favicon set (`apps/web/public/favicon.png`) and `<link>` in `index.html` updated
- [ ] Page `<title>` in `index.html` updated (currently `"web"`)
- [ ] Test on a mobile/touch device — pointer events and canvas sizing
- [ ] Test on Firefox and Safari in addition to Chrome

### Deployment
- [ ] `VITE_API_URL` set to the production backend URL (not `localhost`)
- [ ] Backend `PORT` configurable via environment variable (it already reads `process.env.PORT`)
- [ ] Add a `Procfile` or deployment config if hosting on Railway / Render / Fly.io
- [ ] `node_modules/` confirmed in `.gitignore`

### Documentation
- [ ] README reflects the actual production URL once deployed
- [ ] Add a `LICENSE` file (e.g. MIT)
- [ ] Add a screenshot or demo GIF to the README
