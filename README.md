# Smart Battery Monitoring System (Simulated)

This is a simulated IoT-based system for monitoring battery parameters using Python, MQTT, and AWS IoT concepts.

## Features

- Simulated battery data (temperature, voltage, charge cycles, current, capacity)
- Real-time data publishing via MQTT
- Alert mechanisms for abnormal conditions with email notifications
- Real-time visualization dashboard with historical trends
- REST API for data access
- Configurable settings via config.json
- Logging for debugging and monitoring
- Historical data storage in CSV
- Docker support for containerization

## Requirements

- Python 3.7+
- Install dependencies: `pip install -r requirements.txt`

## Setup

1. Create virtual environment: `python -m venv venv`
2. Activate: `venv\Scripts\activate` (Windows)
3. Install dependencies: `pip install -r requirements.txt`

## Usage

1. Run the publisher to simulate battery data: `python publisher.py`
2. Run the subscriber for alerts (in another terminal): `python subscriber.py`
3. Run the dashboard for visualization: `streamlit run dashboard.py`
4. (Optional) Run the API: `python api.py` (access at http://localhost:5000/data)

## Docker

Build and run with Docker:
```
docker build -t battery-monitor .
docker run -p 8501:8501 -p 5000:5000 battery-monitor
```

## Configuration

Edit `config.json` to customize broker, thresholds, etc.

## Logs

Check .log files for detailed information.

## Notes

- Uses public MQTT broker (broker.hivemq.com) for simulation.
- For production with AWS IoT Core, replace broker with AWS IoT endpoint and use certificates for authentication.
- Explore applications in EV systems and energy storage.