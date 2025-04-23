from flask import Flask, request, jsonify
import numpy as np
import joblib
import google.generativeai as genai
import pandas as pd
import os
from flask_cors import CORS
import bcrypt
import jwt
from functools import wraps
from pymongo import MongoClient
from dotenv import load_dotenv
from flask import request, jsonify
from werkzeug.utils import secure_filename
from io import BytesIO
from gridfs import GridFS
from bson.binary import Binary
import base64
from bson import ObjectId
from flask import Response
from datetime import datetime, timedelta
import time

# Setup environment variables
load_dotenv()
JWT_SECRET = os.getenv("JWT_SECRET")
MONGODB_URI = os.getenv("MONGODB_URI")

app = Flask(__name__)
CORS(app)

# MongoDB client setup
client = MongoClient(MONGODB_URI)
db = client['agroai']
image_collection= db['images']
users_collection = db['users']
notifications_collection = db['notifications']

fs = GridFS(db)

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        print("Received Token:", token)  # Debugging line
        if not token:
            return jsonify({'message': 'Token is missing!'}), 401
        try:
            token = token.split(" ")[1] if " " in token else token
            print("Token after split:", token)  # Debugging line
            data = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
            current_user = users_collection.find_one({"_id": ObjectId(data["user_id"])})
            if not current_user:
                print("User not found:", data["user_id"])  # Debugging line
                raise Exception("User not found")
        except Exception as e:
            print("Error decoding token:", e)  # Debugging line
            return jsonify({'message': 'Token is invalid or expired.', 'error': str(e)}), 401
        return f(current_user, *args, **kwargs)
    return decorated



@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    name = data.get('name')
    email = data.get('email')
    password = data.get('password')

    if users_collection.find_one({'email': email}):
        return jsonify({'message': 'User already exists'}), 409

    hashed_pw = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
    user = {
        'name': name,
        'email': email,
        'password': hashed_pw
    }
    inserted = users_collection.insert_one(user)
    return jsonify({'message': 'User registered successfully', 'user_id': str(inserted.inserted_id)})


@app.route('/login', methods=['POST'])
def login():
    # Verify content type first
    if not request.is_json:
        return jsonify({
            'message': 'Invalid content type',
            'error': 'Request must be application/json'
        }), 400

    try:
        data = request.get_json()
        
        # Validate required fields
        if not data or 'email' not in data or 'password' not in data:
            return jsonify({
                'message': 'Missing required fields',
                'error': 'Both email and password are required'
            }), 400

        email = data['email'].strip().lower()  # Normalize email
        password = data['password']

        # Find user (case-insensitive email search)
        user = users_collection.find_one({'email': {'$regex': f'^{email}$', '$options': 'i'}})
        
        if not user:
            # Don't reveal whether email exists for security
            return jsonify({
                'message': 'Authentication failed',
                'error': 'Invalid email or password'
            }), 401

        # Verify password
        if not bcrypt.checkpw(password.encode('utf-8'), user['password']):
            return jsonify({
                'message': 'Authentication failed',
                'error': 'Invalid email or password'
            }), 401
            
            
        expiration_time = int(time.time()) + 2592000
        # Generate JWT token
        token = jwt.encode({
            'user_id': str(user['_id']),
            'exp': expiration_time
        }, JWT_SECRET, algorithm='HS256')

        # Secure response
        response = jsonify({
            'message': 'Login successful',
            'token': token,
            'user_id': str(user['_id'])
        })
        
        # Set headers
        response.headers['Content-Type'] = 'application/json'
        response.headers['Cache-Control'] = 'no-store'
        
        return response

    except jwt.PyJWTError as e:
        return jsonify({
            'message': 'Token generation failed',
            'error': str(e)
        }), 500
        
    except Exception as e:
        return jsonify({
            'message': 'Server error',
            'error': str(e)
        }), 500



import datetime

@app.route('/upload-image', methods=['POST'])
@token_required
def upload_image(current_user):
    if 'image' not in request.files:
        return jsonify({'error': 'No image part'}), 400
    
    file = request.files['image']
    if file.filename == '':
        return jsonify({'error': 'No selected image'}), 400
    
    try:
        if len(file.read()) < 16 * 1024 * 1024:
            # Read and save the small image
            file.seek(0)  # Reset file pointer after reading
            image_data = file.read()
            image_binary = Binary(image_data)
            
            image_doc = {
                'user_id': current_user['_id'],
                'image_data': image_binary,
                'content_type': file.content_type,
                'filename': secure_filename(file.filename),
                'upload_date': datetime.datetime.utcnow()
            }

            image_id = db.images.insert_one(image_doc).inserted_id
        else:
            # Use GridFS for large files
            file.seek(0)
            image_id = fs.put(file, 
                              filename=secure_filename(file.filename),
                              content_type=file.content_type,
                              user_id=current_user['_id'])
        
        return jsonify({
            'imageId': str(image_id),
            'message': 'Image uploaded successfully'
        }), 200
        
    except Exception as e:
        print(f"Error during image upload: {str(e)}")
        return jsonify({'error': str(e)}), 500



@app.route('/get-image', methods=['GET'])
def get_image():
    # Retrieve image_id from query parameters
    image_id = request.args.get('image_id')
    
    if not image_id:
        return jsonify({'error': 'Image ID is required'}), 400  # Handle missing image_id
    
    print(f"Received image_id: {image_id}")  # Debugging line
    try:
        # Convert the string image_id to ObjectId
        image_id_obj = ObjectId(image_id)

        # Fetch image data from the images collection
        image_doc = db.images.find_one({'_id': image_id_obj})

        if image_doc:
            # Return image stored as Binary
            return Response(image_doc['image_data'], mimetype=image_doc['content_type'])
        
        # If image not found in the collection, try GridFS (if necessary)
        grid_out = fs.get(image_id_obj)
        return Response(grid_out.read(), mimetype=grid_out.content_type)
    
    except Exception as e:
        return jsonify({'error': 'Image not found or error fetching the image', 'message': str(e)}), 404

# Crop addition route
@app.route('/crops', methods=['POST'])
@token_required
def add_crop(current_user):
    try:
        data = request.get_json()

        if not data.get("imageId"):
            return jsonify({"error": "Image ID is required"}), 400

        crop_data = {
            "name": data["name"],
            "price": data["price"],
            "quantity": data["quantity"],
            "user_id": current_user["_id"],
            "image_id": data["imageId"],  # Reference to image
            "created_at": datetime.datetime.utcnow()
        }

        result = db.crops.insert_one(crop_data)

        return jsonify({
            "message": "Crop added successfully",
            "crop_id": str(result.inserted_id)
        }), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Fetch crops route
@app.route('/crops', methods=['GET'])
@token_required
def get_crops(current_user):
    try:
        crops = db.crops.find({"user_id": current_user["_id"]})  # Fetch crops for the user
        crops_list = []

        for crop in crops:
            crop_data = {
                "_id": str(crop["_id"]),
                "name": crop["name"],
                "price": crop["price"],
                "quantity": crop["quantity"],
                "image_id": str(crop["image_id"]),  # Reference to image
                "user_id": str(crop["user_id"]),
                "created_at": crop["created_at"]
            }
            crops_list.append(crop_data)
        
        return jsonify({"crops": crops_list}), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/checkout', methods=['POST'])
@token_required
def checkout(current_user):
    data = request.get_json()
    
    # Log the received data
    print("Received Data:", data)

    cart_items = data.get('cartItems', [])
    if not cart_items:
        return jsonify({"error": "Cart is empty"}), 400

    for item in cart_items:
        print(item['userId'])
        db.notifications.insert_one({
            "image_id": item['image_id'],
            "toUserId": item['userId'],
            "cropName": item['name'],
            "quantity": item['quantity'],
            "totalPrice": item['price'],
            "buyerId": current_user['_id'],  
            "timestamp": datetime.datetime.utcnow(),
            "status": "pending"
        })

    return jsonify({"success": True})

@app.route('/notifications', methods=['GET'])
@token_required
def get_notifications(current_user):
    try:
        print(current_user["_id"])
        notifications = list(notifications_collection.find({"toUserId": str(current_user["_id"])}))
        print(notifications)
        notifications_list = []
        
        for notification in notifications:
            notification_data = {
                "image_id":str(notification["image_id"]),
                "_id": str(notification["_id"]),
                "cropName": notification["cropName"],
                "quantity": notification["quantity"],
                "totalPrice": notification["totalPrice"],
                "buyerId": str(notification["buyerId"]),
                "status": notification.get("status", "pending"),
                "timestamp": notification["timestamp"].strftime("%Y-%m-%d %H:%M:%S")  # Format timestamp
            }
            notifications_list.append(notification_data)
            
        print("hi")
        print(notifications_list)

        return jsonify({"notifications": notifications_list}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# Update the notification status (Accept/Reject)
@app.route('/notifications/<notification_id>', methods=['POST'])
@token_required
def update_notification_status(current_user, notification_id):
    try:
        print(notification_id)
        status = request.json.get('status')
        print(status)
        if status not in ['accepted', 'rejected']:
            return jsonify({'error': 'Invalid status'}), 400

        # Update the notification in the MongoDB collection
        result = notifications_collection.update_one(
            {"_id": ObjectId(notification_id), "toUserId": str(current_user["_id"])},
            {"$set": {"status": status}}
        )

        if result.matched_count == 0:
            return jsonify({'error': 'Notification not found or user not authorized'}), 404

        return jsonify({'message': 'Notification status updated successfully'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
    

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