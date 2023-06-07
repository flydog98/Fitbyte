import smbus2
import bme280
import time as t
import serial
import json
import AWSIoTPythonSDK.MQTTLib as AWSIoTPyMQTT
from datetime import datetime

# MQTT Server Connection
# Define ENDPOINT, CLIENT_ID, PATH_TO_CERTIFICATE, PATH_TO_PRIVATE_KEY, PATH_TO_AMAZON_ROOT_CA_1, MESSAGE, TOPIC, and RANGE
ENDPOINT = "a339j957bfmqt-ats.iot.ap-northeast-2.amazonaws.com"
CLIENT_ID = "testDevice"
PATH_TO_CERTIFICATE = "cert/e433f072777e8f54d172f337bda0fc7f3a54207a2b5ba96a054788784fd673aa-certificate.pem.crt"
PATH_TO_PRIVATE_KEY = "cert/e433f072777e8f54d172f337bda0fc7f3a54207a2b5ba96a054788784fd673aa-private.pem.key"
PATH_TO_AMAZON_ROOT_CA_1 = "cert/root.pem"
RANGE = 20

myAWSIoTMQTTClient = AWSIoTPyMQTT.AWSIoTMQTTClient(CLIENT_ID)
myAWSIoTMQTTClient.configureEndpoint(ENDPOINT, 8883)
myAWSIoTMQTTClient.configureCredentials(PATH_TO_AMAZON_ROOT_CA_1, PATH_TO_PRIVATE_KEY, PATH_TO_CERTIFICATE)

# nova PM
ser = serial.Serial('/dev/ttyUSB0')

# bme280
PORT = 1
ADDRESS = 0x76
BUS = smbus2.SMBus(PORT)

if __name__ == "__main__":
	calibration_params = bme280.load_calibration_params(BUS, ADDRESS)
	myAWSIoTMQTTClient.connect()
	print('Begin Publish')
	while True:
		print("\n" + datetime.now().strftime("%Y-%m-%d %H:%M:%S"))
		
		# nova
		try:
			data = []
			for index in range(0, 10):
				datum = ser.read()
				data.append(datum)
			
			# pm2.5
			pmtwofive = int.from_bytes(b''.join(data[2:4]), byteorder='little') / 10
			myAWSIoTMQTTClient.publish("fitByte/pmtwofive", pmtwofive, 1)
			
			# pm10
			pmten = int.from_bytes(b''.join(data[4:6]), byteorder='little') /10
			myAWSIoTMQTTClient.publish("fitByte/pmten", pmten, 1)
			
			print(f"nova publish success, pm2.5: {pmtwofive}, pm10: {pmten}") 
		except:
			print("nova error")
		
		# bme280
		try:
			data = bme280.sample(BUS, ADDRESS, calibration_params)
			# temperature
			myAWSIoTMQTTClient.publish("fitByte/temperature", data.temperature, 1) 
			
			# humidity
			myAWSIoTMQTTClient.publish("fitByte/humidity", data.humidity, 1) 
			
			# pressure
			myAWSIoTMQTTClient.publish("fitByte/pressure", data.pressure, 1)
			
			print(f"bme280 publish success, temperature: {data.temperature}, humidity: {data.humidity}, pressure: {data.pressure}")
		except:
			print("bme280 error")
		
		t.sleep(15)

	myAWSIoTMQTTClient.disconnect()
