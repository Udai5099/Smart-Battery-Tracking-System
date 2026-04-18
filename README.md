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
python backend/ml_api.py
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
