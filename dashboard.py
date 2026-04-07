import streamlit as st
import paho.mqtt.client as mqtt
import json
import time
import pandas as pd
import logging

with open('config.json', 'r') as f:
    config = json.load(f)

logging.basicConfig(filename='dashboard.log', level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

data = {'temperature': 0, 'voltage': 0, 'charge_cycles': 0}

def on_message(client, userdata, msg):
    global data
    data = json.loads(msg.payload.decode())

BROKER = config['broker']
PORT = config['port']
TOPIC = config['topic']

client = mqtt.Client()
client.on_message = on_message
client.connect(BROKER, PORT)
client.subscribe(TOPIC)
client.loop_start()

st.title("Smart Battery Monitoring Dashboard")
st.write("Real-time battery parameters:")

temp_col, volt_col, cycle_col = st.columns(3)
temp_metric = temp_col.empty()
volt_metric = volt_col.empty()
cycle_metric = cycle_col.empty()
alert_placeholder = st.empty()

st.subheader("Historical Trends")
chart_placeholder = st.empty()

while True:
    temp_metric.metric("Temperature (°C)", f"{data['temperature']:.2f}")
    volt_metric.metric("Voltage (V)", f"{data['voltage']:.2f}")
    cycle_metric.metric("Charge Cycles", data['charge_cycles'])
    alerts = []
    if data['temperature'] > config['alert_thresholds']['temperature']:
        alerts.append("Overheating")
    if data['voltage'] < config['alert_thresholds']['voltage']:
        alerts.append("Low Voltage")
    if data['charge_cycles'] > config['alert_thresholds']['charge_cycles']:
        alerts.append("High Cycles")
    if alerts:
        alert_placeholder.error("Alerts: " + ", ".join(alerts))
    else:
        alert_placeholder.success("All parameters normal")

    try:
        df = pd.read_csv('battery_data.csv')
        df['timestamp'] = pd.to_datetime(df['timestamp'])
        chart_placeholder.line_chart(df.set_index('timestamp')[['temperature', 'voltage', 'charge_cycles']])
    except FileNotFoundError:
        chart_placeholder.write("No historical data yet.")

    time.sleep(1)