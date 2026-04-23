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
from xai.shap_analysis import explain_single_prediction, generate_human_readable_explanation, generate_recommendations

# ------------------ HELPER ------------------

def convert_numpy(obj):
    if isinstance(obj, np.generic):
        return obj.item()
    if isinstance(obj, np.ndarray):
        return obj.tolist()
    if isinstance(obj, dict):
        return {k: convert_numpy(v) for k, v in obj.items()}
    if isinstance(obj, list):
        return [convert_numpy(i) for i in obj]
    return obj

# ------------------ CONFIG ------------------

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

CONFIG_PATH = Path(__file__).parent.parent / "config" / "config.yaml"
with open(CONFIG_PATH, 'r') as f:
    CONFIG = yaml.safe_load(f)

app = Flask(__name__)
frontend_origin = os.environ.get("FRONTEND_ORIGIN", "*")
CORS(app, resources={r"/*": {"origins": frontend_origin}})

MODEL = None
EXPLAINER = None
METADATA = None

# ------------------ LOAD MODEL ------------------

def load_model_artifacts():
    global MODEL, EXPLAINER, METADATA
    try:
        MODEL = joblib.load(CONFIG['model']['model_file'])
        EXPLAINER = shap.TreeExplainer(MODEL)
        METADATA = joblib.load(CONFIG['model']['metadata_file'])
        logger.info("Model loaded successfully")
        return True
    except Exception as e:
        logger.error(f"Model load failed: {e}")
        return False

# ------------------ ROUTES ------------------

@app.route('/health', methods=['GET'])
def health():
    return jsonify({
        "status": "healthy",
        "model_loaded": MODEL is not None,
        "timestamp": datetime.now().isoformat()
    })

@app.route('/predict', methods=['POST'])
def predict():
    if MODEL is None:
        return jsonify({'error': 'Model not loaded'}), 500

    try:
        raw_data = request.get_json()
        if not raw_data:
            return jsonify({'error': 'No data provided'}), 400

        logger.info(f"Incoming data: {raw_data}")

        # --------- FEATURE MAPPING (IMPORTANT) ---------
        data = {
            "voltage_mean": raw_data.get("Voltage_measured"),
            "current_mean": raw_data.get("Current_measured"),
            "temperature_mean": raw_data.get("Temperature_measured"),
            "voltage_min": raw_data.get("Voltage_load"),
            "current_min": raw_data.get("Current_load"),
            "temperature_min": raw_data.get("Temperature_measured"),
            "capacity": raw_data.get("Battery_impedance", 2.5)
        }

        # --------- VALIDATION ---------
        for key, value in data.items():
            if value is None:
                return jsonify({'error': f'Missing field: {key}'}), 400

        # --------- SHAP + PREDICTION ---------
        try:
            explanation = explain_single_prediction(
                data, MODEL, EXPLAINER, None, CONFIG['features']['selected_features']
            )
        except Exception as e:
            logger.warning(f"SHAP failed: {e}")
            # fallback prediction
            df = pd.DataFrame([data])
            pred = MODEL.predict(df)[0]
            explanation = {
                "prediction": pred,
                "raw_prediction": pred,
                "feature_importance": [],
                "top_contributors": []
            }

        explanation_text = generate_human_readable_explanation(explanation)
        recommendations = generate_recommendations(explanation)

        # --------- RESPONSE ---------
        response = {
            "prediction": float(explanation["prediction"]),
            "raw_prediction": float(explanation.get("raw_prediction", explanation["prediction"])),
            "health_status": explanation.get("health_status", "UNKNOWN"),
            "explanation": convert_numpy({
                "text": explanation_text,
                "feature_importance": explanation.get("feature_importance", []),
                "top_contributors": explanation.get("top_contributors", [])
            }),
            "recommendations": convert_numpy(recommendations),
            "confidence": float(calculate_confidence(explanation)),
            "timestamp": datetime.now().isoformat()
        }

        logger.info(f"Prediction: {float(explanation['prediction']):.2f}")
        return jsonify(response)

    except Exception as e:
        logger.error(f"Prediction error: {e}")
        return jsonify({'error': str(e)}), 500


@app.route('/batch_predict', methods=['POST'])
def batch_predict():
    if MODEL is None:
        return jsonify({'error': 'Model not loaded'}), 500

    try:
        data_list = request.get_json()
        if not isinstance(data_list, list):
            return jsonify({'error': 'Expected list'}), 400

        results = []

        for i, raw_data in enumerate(data_list):
            try:
                data = {
                    "voltage_mean": raw_data.get("Voltage_measured"),
                    "current_mean": raw_data.get("Current_measured"),
                    "temperature_mean": raw_data.get("Temperature_measured"),
                    "capacity": raw_data.get("Battery_impedance", 2.5)
                }

                df = pd.DataFrame([data])
                pred = MODEL.predict(df)[0]

                results.append(convert_numpy({
                    "index": i,
                    "prediction": pred
                }))

            except Exception as e:
                results.append({"index": i, "error": str(e)})

        return jsonify({
            "results": results,
            "timestamp": datetime.now().isoformat()
        })

    except Exception as e:
        logger.error(f"Batch error: {e}")
        return jsonify({'error': str(e)}), 500


@app.route('/model_info', methods=['GET'])
def model_info():
    if METADATA is None:
        return jsonify({'error': 'No metadata'}), 500

    return jsonify({
        "model_type": METADATA["model_type"],
        "features": METADATA["features"],
        "metrics": METADATA["metrics"]
    })

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
