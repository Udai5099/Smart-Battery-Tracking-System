# Smart Battery Monitoring System with Explainable AI

A research-driven intelligent battery analytics platform focused on battery health prediction, Remaining Useful Life (RUL) estimation, and Explainable AI (XAI) for real-time decision support systems.

## Live Deployment

- Frontend Dashboard: https://smart-battery-frontend.onrender.com/
- Backend API: https://smart-battery-api.onrender.com/

---

# Overview

This project presents an end-to-end AI-powered battery monitoring framework designed for intelligent maintenance and predictive analytics. The system combines machine learning, explainable AI, and interactive visualization to provide interpretable battery health insights for industrial and research applications.

The platform supports:

- Real-time battery condition monitoring
- Predictive maintenance workflows
- Remaining Useful Life (RUL) estimation
- Explainable model predictions using SHAP
- Human-centered AI decision support

The architecture is modular and scalable, making it suitable for experimentation, research validation, and deployment-oriented demonstrations.

---

# System Architecture

```text
[Battery Dataset] → [Feature Engineering] → [ML Prediction Engine]
         ↓                    ↓                    ↓
   NASA Battery Data     Statistical Features    XGBoost/RF Models
                                                     ↓
                                             [Explainability Layer]
                                                     ↓
                                                SHAP Analysis
                                                     ↓
                                              [Flask REST API]
                                                     ↓
                                           [Interactive Dashboard]
```

---

# Core Features

## Intelligent Battery Analytics

- Battery degradation trend analysis
- Health state monitoring
- Remaining Useful Life prediction
- Predictive maintenance support

## Explainable AI (XAI)

- SHAP-based feature importance analysis
- Interpretable model outputs
- Transparent prediction reasoning
- AI-assisted operational insights

## Interactive Monitoring Dashboard

- Real-time prediction visualization
- Battery performance tracking
- Explainability visual components
- Actionable maintenance indicators

## Machine Learning Pipeline

- Automated preprocessing workflow
- Feature extraction and transformation
- Model training and evaluation
- Performance benchmarking

---

# Technology Stack

| Layer | Technologies |
|---|---|
| Backend | Python, Flask |
| Machine Learning | Scikit-learn, XGBoost |
| Explainable AI | SHAP |
| Frontend | React |
| Data Processing | Pandas, NumPy |
| Visualization | Matplotlib, Plotly |
| Deployment | Render |

---

# Dataset

The implementation utilizes the NASA Prognostics Center of Excellence battery dataset for battery degradation modeling and predictive analysis.

Dataset source:

https://ti.arc.nasa.gov/tech/dash/groups/pcoe/prognostic-data-repository/

Supported battery samples include:

- B0005
- B0006
- B0007
- B0018

---

# Project Structure

```text
├── backend/               # Flask API services
├── frontend/              # React dashboard
├── data/
│   ├── raw/               # Original dataset files
│   └── processed/         # Processed datasets
├── models/                # Training and inference modules
├── xai/                   # SHAP explainability components
├── notebooks/             # Experimental notebooks
├── utils/                 # Helper utilities
├── tests/                 # Test cases
└── requirements.txt
```

---

# Installation

## 1. Clone Repository

```bash
git clone <repository-url>
cd smart-battery-monitoring
```

## 2. Install Dependencies

```bash
pip install -r requirements.txt
```

## 3. Add Dataset Files

Download NASA battery dataset files and place them inside:

```text
data/raw/
```

---

# Running the Project

## Data Preprocessing

```bash
python data/preprocess.py
```

## Model Training

```bash
python models/train.py
```

## SHAP Explainability Analysis

```bash
python xai/shap_analysis.py
```

## Start Backend API

```bash
python backend/api.py
```

## Start Frontend

```bash
cd frontend
npm install
npm start
```

---

# API Endpoints

| Endpoint | Description |
|---|---|
| `/health` | API health status |
| `/predict` | Battery prediction endpoint |
| `/model_info` | Model metadata |
| `/explain` | SHAP explanation results |

---

# Deployment Configuration

The application is deployed as two independent services.

## Backend Service

Handles:
- ML inference
- SHAP explainability
- REST API requests
- Model metadata

## Frontend Service

Handles:
- Dashboard UI
- Visualization components
- User interaction workflows

### Environment Variables

#### Backend

```env
FRONTEND_ORIGIN=https://smart-battery-frontend.onrender.com
```

#### Frontend

```env
REACT_APP_API_URL=https://smart-battery-api.onrender.com
```

---

# Research Contribution

This work explores the integration of:

- Explainable AI for battery diagnostics
- Human-AI collaborative monitoring systems
- Interpretable predictive maintenance workflows
- AI-assisted operational decision support

The implementation emphasizes transparency and usability in AI-driven industrial monitoring systems.

---

# Evaluation Metrics

The framework supports multiple evaluation dimensions:

- RMSE (Root Mean Square Error)
- Prediction Accuracy
- Feature Importance Consistency
- Explainability Analysis
- Residual Error Visualization

---

# Future Enhancements

- Advanced deep learning architectures
- Streaming IoT sensor integration
- Edge deployment optimization
- Multi-battery fleet analytics
- User behavior evaluation studies

---

# Applications

Potential application domains include:

- Electric Vehicle Battery Systems
- Smart Energy Storage
- Industrial IoT Monitoring
- Predictive Maintenance Platforms
- Renewable Energy Infrastructure

---

# Citation

```bibtex
@misc{smart_battery_monitoring_2026,
  title={Smart Battery Monitoring System with Explainable AI},
  author={Udai Tiwari},
  year={2026}
}
```

---

# License

This project is intended for research, academic experimentation, and educational purposes.
