#!/usr/bin/env python3
"""
Smart Battery System - API
Flask API for battery health prediction and SHAP explanations
"""

from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import joblib
import pandas as pd
import numpy as np
import yaml
import sys
import os
from pathlib import Path
import shap
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))
from xai.shap_analysis import explain_single_prediction, generate_human_readable_explanation, generate_recommendations
import logging
from datetime import datetime

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load configuration
CONFIG_PATH = Path(__file__).parent.parent / "config" / "config.yaml"
with open(CONFIG_PATH, 'r') as f:
    CONFIG = yaml.safe_load(f)

app = Flask(__name__)
CORS(app)  # Enable CORS for React frontend
app.static_folder = 'static'

# Load model artifacts
MODEL = None
EXPLAINER = None
METADATA = None

def load_model_artifacts():
    """Load model, explainer, and metadata"""
    global MODEL, EXPLAINER, METADATA

    try:
        MODEL = joblib.load(CONFIG['model']['model_file'])
        # Create explainer instead of loading to avoid version compatibility issues
        EXPLAINER = shap.TreeExplainer(MODEL)
        METADATA = joblib.load(CONFIG['model']['metadata_file'])
        logger.info("Model artifacts loaded successfully")
        return True
    except FileNotFoundError as e:
        logger.error(f"Model artifacts not found: {e}")
        logger.error("Please run models/train.py first")
        return False

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'model_loaded': MODEL is not None
    })

@app.route('/predict', methods=['POST'])
def predict():
    """
    Predict battery RUL and provide SHAP explanation

    Expected JSON payload:
    {
        "voltage_mean": 3.8,
        "voltage_min": 3.2,
        "voltage_max": 4.2,
        "voltage_std": 0.1,
        "current_mean": -1.0,
        "current_min": -2.0,
        "current_max": 0.5,
        "current_std": 0.3,
        "temperature_mean": 25.0,
        "temperature_min": 20.0,
        "temperature_max": 35.0,
        "temperature_std": 2.0,
        "capacity": 2.5
    }
    """
    if MODEL is None:
        return jsonify({'error': 'Model not loaded'}), 500

    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400

        logger.info(f"Received prediction request: {data}")

        # Generate explanation (no scaler needed for XGBoost)
        explanation = explain_single_prediction(
            data, MODEL, EXPLAINER, None, CONFIG['features']['selected_features']
        )

        # Generate human-readable explanation
        explanation_text = generate_human_readable_explanation(explanation)

        # Generate recommendations
        recommendations = generate_recommendations(explanation)

        # Prepare response
        response = {
            'prediction': explanation['prediction'],
            'raw_prediction': explanation.get('raw_prediction', explanation['prediction']),
            'health_status': explanation.get('health_status', 'UNKNOWN'),
            'explanation': {
                'text': explanation_text,
                'feature_importance': explanation['feature_importance'],
                'top_contributors': explanation['top_contributors']
            },
            'recommendations': recommendations,
            'confidence': calculate_confidence(explanation),
            'calibration_info': explanation.get('calibration_info', {}),
            'timestamp': datetime.now().isoformat()
        }

        logger.info(f"Prediction completed: RUL = {explanation['prediction']:.1f}")
        return jsonify(response)

    except Exception as e:
        logger.error(f"Prediction error: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/batch_predict', methods=['POST'])
def batch_predict():
    """
    Predict for multiple battery readings

    Expected JSON payload:
    [
        {"voltage_mean": 3.8, ...},
        {"voltage_mean": 3.7, ...}
    ]
    """
    if MODEL is None:
        return jsonify({'error': 'Model not loaded'}), 500

    try:
        data_list = request.get_json()
        if not isinstance(data_list, list):
            return jsonify({'error': 'Expected list of battery data'}), 400

        results = []
        for i, data in enumerate(data_list):
            try:
                explanation = explain_single_prediction(
                    data, MODEL, EXPLAINER, None, METADATA['features']
                )

                results.append({
                    'index': i,
                    'prediction': explanation['prediction'],
                    'top_contributors': explanation['top_contributors'][:3]
                })

            except Exception as e:
                results.append({
                    'index': i,
                    'error': str(e)
                })

        return jsonify({
            'results': results,
            'timestamp': datetime.now().isoformat()
        })

    except Exception as e:
        logger.error(f"Batch prediction error: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/model_info', methods=['GET'])
def model_info():
    """Get model information and metrics"""
    if METADATA is None:
        return jsonify({'error': 'Model metadata not loaded'}), 500

    return jsonify({
        'model_type': METADATA['model_type'],
        'features': METADATA['features'],
        'metrics': METADATA['metrics'],
        'training_date': METADATA['training_date']
    })

def calculate_confidence(explanation):
    """
    Calculate prediction confidence based on SHAP values
    Higher confidence when top features have strong influence
    """
    top_importance = [abs(imp) for _, imp in explanation['top_contributors'][:3]]
    avg_importance = np.mean(top_importance)

    # Simple confidence calculation (0-1 scale)
    confidence = min(1.0, avg_importance * 10)  # Scale based on importance magnitude

    return float(confidence)

@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Endpoint not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Internal server error'}), 500

if __name__ == "__main__":
    if load_model_artifacts():
        print("Starting ML API server...")
        print("Endpoints:")
        print("  GET  /health - Health check")
        print("  POST /predict - Single prediction with explanation")
        print("  POST /batch_predict - Batch predictions")
        print("  GET  /model_info - Model information")
        print("\nServer running on http://localhost:5001")

        app.run(host='0.0.0.0', port=5001, debug=True)
    else:
        print("Failed to load model artifacts. Please train the model first.")

# Serve React app
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_react(path):
    if path != "" and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, 'index.html')