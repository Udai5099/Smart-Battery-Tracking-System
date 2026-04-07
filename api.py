from flask import Flask, jsonify
import json
import time
from battery_simulator import BatterySimulator

app = Flask(__name__)

battery = BatterySimulator()

@app.route('/data')
def get_data():
    data = battery.get_data()
    battery.update()
    return jsonify(data)

@app.route('/health')
def health():
    return jsonify({"status": "healthy"})

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)