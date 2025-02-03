from flask import Flask, request, jsonify
import mysql.connector
import os
from dotenv import load_dotenv
from flask_cors import CORS

load_dotenv()

app = Flask(__name__)
CORS(app)

# Database Connection
def get_db_connection():
    return mysql.connector.connect(
        host=os.getenv("MYSQL_HOST"),
        user=os.getenv("MYSQL_USER"),
        password=os.getenv("MYSQL_PASSWORD"),
        database=os.getenv("MYSQL_DATABASE")
    )

# Create expenses table if it doesn't exist
def initialize_db():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS expenses (
            id INT AUTO_INCREMENT PRIMARY KEY,
            date DATE NOT NULL,
            amount DECIMAL(10,2) NOT NULL,
            category VARCHAR(50) NOT NULL,
            payment_method VARCHAR(50) NOT NULL
        )
    """)
    conn.commit()
    cursor.close()
    conn.close()

@app.route('/expense', methods=['POST'])
def add_expense():

    # Ensure auth token is included
    token = request.headers.get('Authorization')  
    if not token:
        return jsonify({'message': 'Unauthorized'}), 401
    
    data = request.json
    date = data.get('date')
    amount = data.get('amount')
    category = data.get('category')
    payment_method = data.get('payment_method')
    
    if not all([date, amount, category, payment_method]):
        return jsonify({"message": "All fields are required"}), 400
    
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("INSERT INTO expenses (date, amount, category, payment_method) VALUES (%s, %s, %s, %s)",
                   (date, amount, category, payment_method))
    conn.commit()
    cursor.close()
    conn.close()
    
    return jsonify({"message": "Expense added successfully and stored in MySQL"}), 201

if __name__ == '__main__':
    initialize_db()
    app.run(host='0.0.0.0', port=5001, debug=True)
