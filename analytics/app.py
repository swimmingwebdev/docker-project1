from flask import Flask, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import pymysql
import pymongo
import os

load_dotenv()

app = Flask(__name__)
CORS(app)

# Connect to MySQL
mysql_conn = pymysql.connect(
    host=os.getenv("MYSQL_HOST"),
    user=os.getenv("MYSQL_USER"),
    password=os.getenv("MYSQL_PASSWORD"),
    database=os.getenv("MYSQL_DATABASE"),
    cursorclass=pymysql.cursors.DictCursor
)

# Connect to MongoDB
mongo_client = pymongo.MongoClient(os.getenv("MONGO_URI"))
mongo_db = mongo_client["analytics_db"]
analytics_collection = mongo_db["analytics"]

def update_analytics():
    try:
        with mysql_conn.cursor() as cursor:
            # Calculate total spending
            cursor.execute("SELECT SUM(amount) as total_spending FROM expenses")
            total_spending = float(cursor.fetchone()["total_spending"] or 0)

            # Calculate average spending per category
            cursor.execute("SELECT category, AVG(amount) as avg_spending FROM expenses GROUP BY category")
            avg_spending_per_category = {row["category"]: float(row["avg_spending"]) for row in cursor.fetchall()}

            # Find the category with the highest spending
            cursor.execute("SELECT category, SUM(amount) as total FROM expenses GROUP BY category ORDER BY total DESC LIMIT 1")
            highest_spending_category = cursor.fetchone()
            highest_category = highest_spending_category["category"] if highest_spending_category else "None"

            # Generate monthly spending report
            cursor.execute("SELECT DATE_FORMAT(date, '%Y-%m') as month, SUM(amount) as total FROM expenses GROUP BY month")
            monthly_report = {row["month"]: float(row["total"]) for row in cursor.fetchall()}

            # Save to MongoDB
            analytics_data = {
                "total_spending": total_spending,
                "average_spending_per_category": avg_spending_per_category,
                "highest_spending_category": highest_category,
                "monthly_report": monthly_report
            }
            analytics_collection.update_one({}, {"$set": analytics_data}, upsert=True)

        return {"message": "Analytics updated successfully"}
    
    except Exception as e:
        return {"error": str(e)}
    
# to trigger analytics update
@app.route("/update-analytics", methods=["POST"])
def update_analytics_route():
    result = update_analytics()
    return jsonify(result)

@app.route("/analytics", methods=["GET"])
def get_analytics():
    try:
        with mysql_conn.cursor() as cursor:

            cursor.execute("SELECT SUM(amount) as total_spending FROM expenses")
            total_spending = float(cursor.fetchone()["total_spending"] or 0)

            cursor.execute("SELECT category, AVG(amount) as avg_spending FROM expenses GROUP BY category")
            avg_spending_per_category = {row["category"]: float(row["avg_spending"]) for row in cursor.fetchall()}

            cursor.execute("SELECT category, SUM(amount) as total FROM expenses GROUP BY category ORDER BY total DESC LIMIT 1")
            highest_spending_category = cursor.fetchone()
            highest_category = highest_spending_category["category"] if highest_spending_category else "None"

            cursor.execute("SELECT DATE_FORMAT(date, '%Y-%m') as month, SUM(amount) as total FROM expenses GROUP BY month")
            monthly_report = {row["month"]: float(row["total"]) for row in cursor.fetchall()}

            # Save to MongoDB
            analytics_data = {
                "total_spending": total_spending,
                "average_spending_per_category": avg_spending_per_category,
                "highest_spending_category": highest_category,
                "monthly_report": monthly_report
            }
            analytics_collection.update_one({}, {"$set": analytics_data}, upsert=True)

        return jsonify(analytics_data)
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5003, debug=True)