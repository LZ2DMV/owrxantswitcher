from flask import Flask, request, jsonify
from flask_cors import CORS
import RPi.GPIO as GPIO
import os

num_antennas = 3 

antenna_pins = [23, 24]

app = Flask(__name__)
CORS(app)
GPIO.setmode(GPIO.BCM)

for pin in antenna_pins:
    GPIO.setup(pin, GPIO.OUT)

antennaFile = 'antenna.txt'

def read_active_antenna():
    if os.path.exists(antennaFile):
        with open(antennaFile, 'r') as file:
            return file.read().strip()
    return None

def write_active_antenna(value):
    with open(antennaFile, 'w') as file:
        file.write(value)

def set_gpio_for_antenna(antenna_id):
    if antenna_id == 1:
        GPIO.output(23, GPIO.HIGH)
        if GPIO.input(24) == GPIO.HIGH:
            GPIO.output(24, GPIO.LOW)
    elif antenna_id == 2:
        if GPIO.input(23) == GPIO.HIGH:
            GPIO.output(23, GPIO.LOW)
        if GPIO.input(24) == GPIO.HIGH:
            GPIO.output(24, GPIO.LOW)
    elif antenna_id == 3:
        GPIO.output(24, GPIO.HIGH)
        if GPIO.input(23) == GPIO.HIGH:
            GPIO.output(23, GPIO.LOW)

def initialize_antenna():
    active_antenna = read_active_antenna()
    if active_antenna and active_antenna.isdigit() and 1 <= int(active_antenna) <= num_antennas:
        set_gpio_for_antenna(int(active_antenna))
    else:
        set_gpio_for_antenna(1)
        write_active_antenna('1')

@app.route('/antenna_switch', methods=['POST'])
def antennaswitch():
    data = request.get_json()
    command = data.get('command')

    if str(command).isdigit() and 1 <= int(command) <= num_antennas:
        return set_antenna(int(command))
    elif command == 's':
        return get_active_antenna()
    elif command == 'n':
        return get_antenna_count()
    else:
        return jsonify({'error': 'Invalid command'}), 400

def get_active_antenna():
    active_antenna = read_active_antenna()
    if active_antenna is None:
        return jsonify(payload={'response': '0'})
    return jsonify(payload={'response': active_antenna})

def get_antenna_count():
    return jsonify(payload={'response': f'n:{num_antennas}'})

def set_antenna(antenna_id):
    active_antenna = read_active_antenna()
    if active_antenna == str(antenna_id):
        return jsonify(payload={'response': str(antenna_id)})

    try:
        set_gpio_for_antenna(antenna_id)
        write_active_antenna(str(antenna_id))
        return jsonify(payload={'response': str(antenna_id)})
    except Exception as e:
        print(f"Error: {e}")
        return jsonify(payload={'response': '0'}), 500

if __name__ == '__main__':
    initialize_antenna()
    app.run(host='127.0.0.1', port=8075)
