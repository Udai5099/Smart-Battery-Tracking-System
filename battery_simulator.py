import random
import logging

logging.basicConfig(filename='battery_simulator.log', level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

class BatterySimulator:
    """
    Simulates a battery with parameters: temperature, voltage, charge cycles, current, capacity.
    """
    def __init__(self):
        self.temperature = 25.0
        self.voltage = 12.0
        self.charge_cycles = 0
        self.current = 0.0
        self.capacity = 100.0
        logging.info("BatterySimulator initialized")

    def update(self):
        self.temperature += random.uniform(-2, 2)
        self.temperature = max(0, min(100, self.temperature))
        self.voltage += random.uniform(-0.5, 0.5)
        self.voltage = max(0, min(15, self.voltage))
        self.current += random.uniform(-1, 1)
        self.current = max(-5, min(5, self.current))
        self.capacity -= random.uniform(0, 0.1)
        self.capacity = max(0, self.capacity)
        if random.random() < 0.1:
            self.charge_cycles += 1
        logging.info(f"Battery updated: temp={self.temperature:.2f}, volt={self.voltage:.2f}, cycles={self.charge_cycles}, current={self.current:.2f}, capacity={self.capacity:.2f}")

    def get_data(self):
        return {
            'temperature': self.temperature,
            'voltage': self.voltage,
            'charge_cycles': self.charge_cycles,
            'current': self.current,
            'capacity': self.capacity
        }