from flask import Flask, request, jsonify
import numpy as np
import joblib
import google.generativeai as genai
import pandas as pd
import os
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Configure Generative AI model
API_KEY = "AIzaSyBOxLw8oGJMC_6vJU1-A4zwiPkRCijlCZM"
if not API_KEY:
    raise ValueError("Please set the environment variable 'GENAI_API_KEY'.")
genai.configure(api_key=API_KEY)
model = genai.GenerativeModel('gemini-2.0-flash')

SYSTEM_PROMPT = '''
You are AgroBuddy, a friendly farming assistant. Follow these rules:
1. Respond warmly to greetings 
2. For farming questions, give concise, helpful answers
3. For other topics, politely redirect ("I'd love to chat about farming! Ask me about crops or livestock")
4. Maintain natural conversation flow
'''

conversation_history = []

def is_greeting(text):
    greetings = ["hi", "hello", "hey", "greetings"]
    return any(word in text.lower() for word in greetings)

def chat_with_farmer(user_input):
    global conversation_history

    if is_greeting(user_input):
        return "Hello! I'm AgroBuddy, your farming assistant. What would you like to know about agriculture today?"

    prompt = SYSTEM_PROMPT + "\nRecent chat:\n" + "\n".join(conversation_history[-4:]) + f"\nUser: {user_input}"
    response = model.generate_content(prompt)
    bot_response = response.text

    conversation_history.append(f"User: {user_input}")
    conversation_history.append(f"AgroBuddy: {bot_response}")

    return bot_response

# Load the crop recommendation model
crop_model = joblib.load("crop_model.pkl")

# Load the yield prediction model
yield_model = joblib.load("yield_model.pkl")

# Load the fertilizer recommendation model
fertilizer_model = joblib.load("fertilizer_model.pkl")


expected_columns = yield_model.feature_names_in_
# print(expected_columns)

# Feature columns for yield prediction model
X_columns = ['Area_Rainfall', 'log_Area', 'Crop_Rabi', 'Crop_Wheat', 'Season_Winter', 'State_Punjab']

def predict_yield(crop, crop_year, season, state, area, annual_rainfall, fertilizer, pesticide):
    custom_input = pd.DataFrame([{
        "Crop": crop,
        "Crop_Year": crop_year,
        "Season": season,
        "State": state,
        "Area": area,
        "Annual_Rainfall": annual_rainfall,
        "Fertilizer": fertilizer,
        "Pesticide": pesticide
    }])
    
    # Calculate additional features
    custom_input["Area_Rainfall"] = custom_input["Area"] * custom_input["Annual_Rainfall"]
    custom_input["log_Area"] = np.log1p(custom_input["Area"])

    # Perform one-hot encoding
    custom_input = pd.get_dummies(custom_input)

    # Ensure all expected columns are present
    expected_columns = yield_model.feature_names_in_
    missing_cols = set(expected_columns) - set(custom_input.columns)
    for col in missing_cols:
        custom_input[col] = 0

    # Reorder columns to match the training data
    custom_input = custom_input[expected_columns]

    # Make prediction
    predicted_yield = yield_model.predict(custom_input)
    return predicted_yield[0]


@app.route("/", methods=["GET"])
def home():
    return jsonify({"message": "Welcome to the Crop Recommendation and Yield Prediction API!"})

@app.route("/predict", methods=["POST"])
def predict():
    try:
        data = request.get_json()
        
        # Extract features for crop recommendation
        features = np.array([data["N"], data["P"], data["K"], data["temperature"], 
                             data["humidity"], data["ph"], data["rainfall"]]).reshape(1, -1)

        # Make crop recommendation prediction
        crop_prediction = crop_model.predict(features)[0]

        # Return crop recommendation
        return jsonify({"recommended_crop": crop_prediction})

    except Exception as e:
        return jsonify({"error": str(e)}), 500
@app.route("/yield_predict", methods=["POST"])  # Changed to POST
def yield_predict():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No JSON data received"}), 400
        
        # Extract features for yield prediction
        crop = data.get("Crop")
        crop_year = data.get("Crop_Year")
        season = data.get("Season")
        state = data.get("State")
        area = data.get("Area")
        annual_rainfall = data.get("Annual_Rainfall")
        fertilizer = data.get("Fertilizer")
        pesticide = data.get("Pesticide")
        
        if not all([crop, crop_year, season, state, area, annual_rainfall, fertilizer, pesticide]):
            return jsonify({"error": "Missing one or more required fields."}), 400

        # Make yield prediction
        yield_prediction = predict_yield(crop, crop_year, season, state, area, annual_rainfall, fertilizer, pesticide)

        # Convert yield_prediction to standard Python float before returning
        yield_prediction = float(yield_prediction)

        # Return yield prediction
        return jsonify({"predicted_yield": round(yield_prediction, 2)})

    except Exception as e:
        return jsonify({"error": str(e)}), 500



# Load the fertilizer recommendation model
fertilizer_model = joblib.load("fertilizer_model.pkl")

# Manually encoded values for Soil Types and Crop Types
soil_type_encoding = {
    "Black": 0.0,
    "Clayey": 1.0,
    "Loamy": 2.0,
    "Red": 3.0,
    "Sandy": 4.0
}

crop_type_encoding = {
    "Barley": 0.0,
    "Coffee": 1.0,
    "Cotton": 2.0,
    "Ground Nuts": 3.0,
    "Kidneybeans": 4.0,
    "Maize": 5.0,
    "Millets": 6.0,
    "Oil seeds": 7.0,
    "Orange": 8.0,
    "Paddy": 9.0,
    "Pomegranate": 10.0,
    "Pulses": 11.0,
    "Rice": 12.0,
    "Sugarcane": 13.0,
    "Tobacco": 14.0,
    "Watermelon": 15.0,
    "Wheat": 16.0
}

@app.route("/fertilizer_predict", methods=["POST"])
def fertilizer_predict():
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({"error": "No JSON data received"}), 400
        
        # Extract features for fertilizer recommendation
        jsonT = float(data["temperature"])
        jsonH = float(data["humidity"])
        jsonSM = float(data["moisture"])
        jsonsoil = data["soil_type"]
        jsoncrop = data["crop_type"]
        jsonN = float(data["N"])
        jsonK = float(data["K"])
        jsonP = float(data["P"])

        # Encode categorical inputs (Soil Type and Crop Type)
        if jsonsoil not in soil_type_encoding or jsoncrop not in crop_type_encoding:
            return jsonify({"error": "Invalid soil_type or crop_type provided"}), 400

        soil_enc = soil_type_encoding[jsonsoil]
        crop_enc = crop_type_encoding[jsoncrop]
        print(soil_enc)
        # Create the input array
        features = np.array([[jsonT, jsonH, jsonSM, soil_enc, crop_enc, jsonN, jsonK, jsonP]])

        # Make fertilizer recommendation prediction
        fertilizer_prediction = fertilizer_model.predict(features)[0]

        # Return fertilizer recommendation
        return jsonify({"recommended_fertilizer": fertilizer_prediction})

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True)



@app.route("/chat", methods=["POST"])
def chat():
    try:
        data = request.get_json()
        user_input = data.get('query')
        if not user_input:
            return jsonify({"error": "No query provided."}), 400

        response = chat_with_farmer(user_input)

        return jsonify({"response": response})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Run the Flask server
if __name__ == "__main__":
    # app.run(debug=True, host="0.0.0.0", port=5000)
    app.run(host="127.0.0.1", port=5000)

