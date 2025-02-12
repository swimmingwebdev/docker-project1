const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { MongoClient } = require("mongodb");
const axios = require("axios");

require("dotenv").config({ path: "../../.env" });
console.log("MongoDB URI:", process.env.MONGO_URI || "Check .env file");

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB Once at Startup
const MONGO_URI = process.env.MONGO_URI || "mongodb://expense-mongo-server:27017";
const mongoClient = new MongoClient(MONGO_URI);

let db;

async function connectMongoDB() {
    try {
        await mongoClient.connect();
        db = mongoClient.db("analytics_db");
        console.log("Connected to MongoDB");

        const collection = db.collection("analytics");
        const docCount = await collection.countDocuments();
        
        if (docCount === 0) {
            await collection.insertOne({
                total_spending: 0,
                average_spending_per_category: {},
                highest_spending_category: "",
                monthly_report: {}
            });
            console.log("Initialized analytics collection");
        } else {
            console.log("Analytics collection already exists.");
        }

    } catch (error) {
        console.error("MongoDB Connection Failed:", error);
        process.exit(1); // Stop server if MongoDB connection fails
    }
}
connectMongoDB();


// Middleware to verify authentication
async function authenticate(req, res, next) {
    let token = req.headers.authorization;
    console.log("Received Token:", token); 

    if (!token) {
        console.log("No Token Provided");
        return res.status(401).json({ message: "Unauthorized - No Token Provided" });
    }

    // Ensure "Bearer" is removed before verifying
    if (token.startsWith("Bearer ")) {
        token = token.slice(7, token.length).trim();
    }

    try {
        const response = await axios.get("http://localhost:5000/auth/verify", {
            headers: { Authorization: `Bearer ${token}` },
        });

        if (response.data.message === "Token is valid") {
            next();
        } else {
            res.status(401).json({ message: "Invalid Token" });
        }
    } catch (error) {
        console.error("Authentication error:", error.response ? error.response.data : error.message);
        res.status(500).json({ message: "Authentication Service Unreachable" });
    }
}


// Fetch analytics from MongoDB
app.get("/analytics", authenticate, async (req, res) => {
    try {
        const analytics = await db.collection("analytics").findOne({});
        
        if (!analytics) {
            console.log("No analytics data found in MongoDB.");
            return res.status(404).json({ message: "No analytics data found" });
        }

        console.log("Fetched Analytics Data:", analytics);  // Debugging
        res.json(analytics);
    } catch (error) {
        console.error("Error fetching analytics:", error);
        res.status(500).json({ message: "Error fetching analytics" });
    }
});

const PORT = process.env.PORT || 5002;
app.listen(PORT, () => {
    console.log(`Show Results Service running on port ${PORT}`);
});