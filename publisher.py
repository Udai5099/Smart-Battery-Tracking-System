import paho.mqtt.client as mqtt
import json
import time
import logging
from battery_simulator import BatterySimulator
import csv

with open('config.json', 'r') as f:
    config = json.load(f)

logging.basicConfig(filename='publisher.log', level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

BROKER = config['broker']
PORT = config['port']
TOPIC = config['topic']
UPDATE_INTERVAL = config['update_interval']

client = mqtt.Client(mqtt.CallbackAPIVersion.VERSION2)
client.connect(BROKER, PORT)

battery = BatterySimulator()

with open('battery_data.csv', 'a', newline='') as csvfile:
    fieldnames = ['timestamp', 'temperature', 'voltage', 'charge_cycles', 'current', 'capacity']
    writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
    if csvfile.tell() == 0:
        writer.writeheader()

    while True:
        data = battery.get_data()
        timestamp = time.strftime('%Y-%m-%d %H:%M:%S')
        row = {'timestamp': timestamp, **data}
        writer.writerow(row)
        csvfile.flush()
        client.publish(TOPIC, json.dumps(data))
        logging.info(f"Published: {data}")
        battery.update()
        time.sleep(UPDATE_INTERVAL)