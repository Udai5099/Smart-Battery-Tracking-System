# Smart Battery Monitoring System - Research Implementation

This is a research-oriented implementation of a Human-AI Interaction system for battery health monitoring, designed for Track 5 conference submission.

## Research Focus

- **Explainable AI (XAI)**: SHAP-based explanations for model predictions
- **Human-AI Interaction**: Dashboard with predictions, explanations, and recommendations
- **Real-time Decision Support**: Alerts and actionable insights for battery maintenance

## Architecture

```
[Data Processing] → [ML Model] → [XAI Layer] → [API] → [Dashboard]
     ↓              ↓            ↓          ↓         ↓
 NASA Dataset    Xgboost        SHAP     Flask     React
```

## Quick Start

### 1. Setup Environment
```bash
pip install -r requirements.txt
```

### 2. Download NASA Battery Dataset
- Visit: https://ti.arc.nasa.gov/tech/dash/groups/pcoe/prognostic-data-repository/
- Download Battery Data Set files (B0005.mat, B0006.mat, etc.)
- Place .mat files in `data/raw/` directory

### 3. Process Data
```bash
python data/preprocess.py
```

### 4. Train Model
```bash
python models/train.py
```

### 5. Run SHAP Analysis
```bash
python xai/shap_analysis.py
```

### 6. Start ML API
```bash
python backend/api.py
```

### 7. Evaluate Model
```bash
python models/evaluate.py
```

## Project Structure

```
├── data/
│   ├── raw/              # NASA .mat files
│   └── processed/        # Processed CSV data
├── models/               # ML models and training
├── xai/                  # SHAP explanations
├── backend/              # Flask API
├── frontend/             # React dashboard (TODO)
├── notebooks/            # Jupyter experiments
├── tests/                # Unit tests
└── utils/                # Utilities
```

## Render Deployment

This repo is configured for two separate Render services:

- `smart-battery-api`: Python web service for Flask, predictions, SHAP, and model metadata.
- `smart-battery-frontend`: React static site for the dashboard.

You can deploy both from `render.yaml` using Render Blueprints. After Render creates both services, set these environment variables:

### Backend service

```text
FRONTEND_ORIGIN=https://your-frontend-site.onrender.com
```

This controls CORS. Use the exact URL Render gives your frontend static site.

### Frontend static site

```text
REACT_APP_API_URL=https://your-api-service.onrender.com
```

This is baked into the React build, so redeploy the frontend after setting or changing it.

### Local development

Start the API:

```bash
python backend/api.py
```

Start the frontend in another terminal:

```bash
cd frontend
npm install
npm start
```

For local React development, either rely on the `proxy` in `frontend/package.json` or create `frontend/.env` from `frontend/.env.example`.

### Troubleshooting asset 404s

If the browser reports `manifest.json` syntax errors or `main.*.js` / `main.*.css` 404s, check which Render URL you opened:

- Open the frontend static site URL to use the dashboard.
- Open the backend web service URL only for API endpoints such as `/health`, `/predict`, and `/model_info`.
- `REACT_APP_API_URL` must point to the backend URL.
- `FRONTEND_ORIGIN` must point to the frontend URL.

Those asset errors usually mean the browser requested React files from the API service, or the static site publish path is not `frontend/build`.

## Research Metrics

- **RMSE**: Model prediction accuracy
- **SHAP Explanations**: Feature importance analysis
- **Human Evaluation**: User study results (planned)

## Key Features

✅ **Data Processing**: NASA battery dataset preprocessing
✅ **ML Model**: Random Forest for RUL prediction
✅ **XAI**: SHAP-based explainable predictions
✅ **API**: RESTful endpoints for predictions
✅ **Evaluation**: Comprehensive model assessment
✅ **Visualization**: SHAP plots and residual analysis

## Conference Track

**Track 5: Human-AI Interaction** - This system demonstrates:
- Explainable AI for decision support
- Human-in-the-loop battery monitoring
- Actionable recommendations based on AI predictions

## Next Steps

1. Complete React frontend dashboard
2. Conduct user studies for evaluation
3. Write research paper with findings
4. Submit to conference

## Citation

If you use this code in your research, please cite:

```
@misc{battery-monitoring-research,
  title={Smart Battery Monitoring System with Explainable AI},
  author={Your Name},
  year={2026}
}
```

## Notes

- Uses public MQTT broker (broker.hivemq.com) for simulation.
- For production with AWS IoT Core, replace broker with AWS IoT endpoint and use certificates for authentication.
- Explore applications in EV systems and energy storage.
