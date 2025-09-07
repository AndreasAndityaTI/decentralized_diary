import os
import numpy as np
import tensorflow as tf
import tensorflow_hub as hub
from flask import Flask, request, jsonify
from flask_cors import CORS

# Suppress TensorFlow logging
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'

app = Flask(__name__)
CORS(app)

# Load pre-trained model from TensorFlow Hub
model_url = "https://tfhub.dev/google/tf2-preview/gnews-swivel-20dim-with-oov/1"
hub_layer = hub.KerasLayer(model_url, output_shape=[20], input_shape=[], dtype=tf.string, trainable=False)

model = tf.keras.Sequential()
model.add(hub_layer)
model.add(tf.keras.layers.Dense(16, activation='relu'))
model.add(tf.keras.layers.Dense(1, activation='sigmoid'))

model.compile(optimizer='adam',
              loss='binary_crossentropy',
              metrics=['accuracy'])

@app.route('/sentiment', methods=['POST'])
def predict_sentiment():
    data = request.get_json()
    if 'inputs' not in data:
        return jsonify({'error': 'Missing "inputs" in request body'}), 400

    text = data['inputs']
    prediction = model.predict([text])
    score = float(prediction[0][0])

    # Simple mapping of score to label
    if score > 0.6:
        label = 'POSITIVE'
    elif score < 0.4:
        label = 'NEGATIVE'
    else:
        label = 'NEUTRAL'

    return jsonify({'label': label, 'score': score})

if __name__ == '__main__':
    app.run(port=5000)