from flask import Flask, request, jsonify
from datetime import datetime, timedelta, timezone
from flask_cors import CORS
import jwt
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

SECRET_KEY = os.getenv('JWT_SECRET_KEY')
# USER_ID = os.getenv('USER_ID')
# USER_PASSWORD = os.getenv('USER_PASSWORD')

registered_users = {}

# Register new user
@app.route('/auth/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({'message': 'Username and password required'}), 400

    if username in registered_users:
        return jsonify({'message': 'User already exists'}), 409

    registered_users[username] = password
    return jsonify({'message': 'User registered successfully'}), 201

#  when user tries to log in
@app.route('/auth/login', methods=['POST'])
def login():

    username = request.json.get('username')
    password = request.json.get('password')
    
    if not username or not password:
        return jsonify({
            'message': 'Please provide username and password'
        }), 401
    
    if username in registered_users and registered_users[username] == password:
        # Create token that expires in 24 hours
        token = jwt.encode({
            'user': username,
            'exp': datetime.now(timezone.utc) + timedelta(hours=24)
        }, SECRET_KEY)
        
        return jsonify({
            'token': token,
            'message': 'Login successful'
        })
    
    return jsonify({
        'message': 'Wrong username or password'
    }), 401

# check if token is valid
@app.route('/auth/verify', methods=['GET'])
def verify():

    # Get token from request header
    # To prevent access protected routes without logging in
    token = request.headers.get('Authorization')
    
    if not token:
        return jsonify({
            'message': 'Please provide token'
        }), 401
    
    try:
        # Ensure "Bearer" is removed
        token = token.replace("Bearer ", "").strip()
        # Check if the token is real and hasn't expired
        jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        return jsonify({
            'message': 'Token is valid'
        })
    
    except:
        return jsonify({
            'message': 'Token is not valid'
        }), 401

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)