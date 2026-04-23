#!/usr/bin/env python3

from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import pandas as pd
import numpy as np
import yaml
import sys
import os
from pathlib import Path
import shap
from datetime import datetime
import logging

sys.path.append(os.path.join(os.path.dirname(__file__), '..'))
from xai.shap_analysis import (
    explain_single_prediction,
    generate_human_readable_explanation,
    generate_recommendations
)

# ------------------ LOGGER ------------------
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ------------------ CONFIG ------------------
CONFIG_PATH = Path(__file__).parent.parent / "config" / "config.yaml"
with open(CONFIG_PATH, 'r') as f:
    CONFIG = yaml.safe_load(f)

app = Flask(__name__)
CORS(app)

MODEL = None
EXPLAINER = None
METADATA = None

# ------------------ SAFE JSON CONVERTER ------------------
def convert_numpy(obj):
    if isinstance(obj, np.generic):
        return obj.item()
    if isinstance(obj, np.ndarray):
        return obj.tolist()
    if isinstance(obj, dict):
        return {k: convert_numpy(v) for k, v in obj.items()}
    if isinstance(obj, list):
        return [convert_numpy(i) for i in obj]
    if isinstance(obj, tuple):  # 🔥 critical fix
        return [convert_numpy(i) for i in obj]
    return obj

# ------------------ LOAD MODEL ------------------
def load_model_artifacts():
    global MODEL, EXPLAINER, METADATA
    try:
        MODEL = joblib.load(CONFIG['model']['model_file'])
        EXPLAINER = shap.TreeExplainer(MODEL)
        METADATA = joblib.load(CONFIG['model']['metadata_file'])
        logger.info("Model loaded successfully")
    except Exception as e:
        logger.error(f"Model load failed: {e}")

# ------------------ ROUTES ------------------

@app.route('/')
def home():
    return jsonify({
        "message": "Smart Battery API running 🚀",
        "endpoints": ["/health", "/predict", "/batch_predict"]
    })

@app.route('/health')
def health():
    return jsonify({
        "status": "healthy",
        "model_loaded": MODEL is not None
    })

# ------------------ PREDICT ------------------

@app.route('/predict', methods=['POST'])
def predict():
    if MODEL is None:
        return jsonify({"error": "Model not loaded"}), 500

    try:
        raw_data = request.get_json()
        if not raw_data:
            return jsonify({"error": "No data provided"}), 400

        logger.info(f"Incoming: {raw_data}")

        # 🔥 Map frontend → model features
        data = {
            "voltage_mean": raw_data.get("Voltage_measured"),
            "current_mean": raw_data.get("Current_measured"),
            "temperature_mean": raw_data.get("Temperature_measured"),
            "voltage_min": raw_data.get("Voltage_load"),
            "current_min": raw_data.get("Current_load"),
            "capacity": raw_data.get("Battery_impedance", 2.5)
        }

        # 🔥 Validate
        for k, v in data.items():
            if v is None:
                return jsonify({"error": f"Missing {k}"}), 400

        # 🔥 Prediction + SHAP
        try:
            explanation = explain_single_prediction(
                data, MODEL, EXPLAINER, None,
                CONFIG['features']['selected_features']
            )
        except Exception as e:
            logger.warning(f"SHAP failed: {e}")
            df = pd.DataFrame([data])
            pred = MODEL.predict(df)[0]
            explanation = {
                "prediction": pred,
                "top_contributors": []
            }

        # 🔥 Clean top contributors (major crash source)
        top_contributors = [
            [str(k), float(v)]
            for k, v in explanation.get("top_contributors", [])
        ]

        explanation_text = generate_human_readable_explanation(explanation)
        recommendations = generate_recommendations(explanation)

        # 🔥 FINAL RESPONSE (fully safe)
        response = {
            "prediction": float(explanation["prediction"]),
            "health_status": explanation.get("health_status", "UNKNOWN"),
            "explanation": {
                "text": str(explanation_text),
                "top_contributors": top_contributors
            },
            "recommendations": convert_numpy(recommendations),
            "confidence": float(calculate_confidence(explanation)),
            "timestamp": datetime.now().isoformat()
        }

        # 🔥 FINAL CLEAN (guaranteed safe)
        return jsonify(convert_numpy(response))

    except Exception as e:
        logger.error(f"Prediction error: {e}")
        return jsonify({"error": str(e)}), 500


# ------------------ BATCH ------------------

@app.route('/batch_predict', methods=['POST'])
def batch_predict():
    try:
        data_list = request.get_json()
        results = []

        for i, d in enumerate(data_list):
            try:
                df = pd.DataFrame([d])
                pred = MODEL.predict(df)[0]

                results.append({
                    "index": i,
                    "prediction": float(pred)
                })
            except Exception as e:
                results.append({"index": i, "error": str(e)})

        return jsonify(results)

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ------------------ CONFIDENCE ------------------

def calculate_confidence(explanation):
    try:
        vals = [abs(v) for _, v in explanation.get("top_contributors", [])[:3]]
        return float(min(1.0, np.mean(vals) * 10))
    except:
        return 0.5


# ------------------ START ------------------

load_model_artifacts()

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5001))
    app.run(host="0.0.0.0", port=port)
