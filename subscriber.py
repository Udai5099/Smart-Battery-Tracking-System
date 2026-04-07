import paho.mqtt.client as mqtt
import json
import logging
import smtplib
from email.mime.text import MIMEText

with open('config.json', 'r') as f:
    config = json.load(f)

logging.basicConfig(filename='subscriber.log', level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

def send_email_alert(subject, body):
    print(f"EMAIL ALERT: {subject} - {body}")
    logging.warning(f"Email alert: {subject} - {body}")

def on_message(client, userdata, msg):
    data = json.loads(msg.payload.decode())
    logging.info(f"Received: {data}")
    alerts = []
    if data['temperature'] > config['alert_thresholds']['temperature']:
        alerts.append("Overheating detected!")
    if data['voltage'] < config['alert_thresholds']['voltage']:
        alerts.append("Low voltage detected!")
    if data['charge_cycles'] > config['alert_thresholds']['charge_cycles']:
        alerts.append("High charge cycles, battery may need replacement!")
    if data['capacity'] < 20:
        alerts.append("Low capacity detected!")
    if alerts:
        for alert in alerts:
            print(alert)
            send_email_alert("Battery Alert", alert)
            logging.warning(alert)

BROKER = config['broker']
PORT = config['port']
TOPIC = config['topic']

client = mqtt.Client(mqtt.CallbackAPIVersion.VERSION2)
client.on_message = on_message
client.connect(BROKER, PORT)
client.subscribe(TOPIC)
logging.info("Subscriber started")
client.loop_forever()