import sys
import numpy as np
import pandas as pd
import joblib  # To save and load trained models

# Load trained model (Save your model after training using joblib)
model = joblib.load("crop_model.pkl")  # Ensure this file exists

# Get input features from command line args
features = np.array(sys.argv[1:], dtype=float).reshape(1, -1)

# Predict Crop
prediction = model.predict(features)[0]

print(prediction)  # Send output back to Node.js
