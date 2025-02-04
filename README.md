### ACIT3495 - Project1

#### Group3 
- Team members
  - Austin Park
  - Keziah Wacnang
  - Yang Jung

### Data Collection and Analytics System (Daily Expense Tracker)

### 1. Authentication Service

#### Languages
- Backend: Python(Flask)

#### Features
- User login with username/password
- JWT token generation & verification
  
#### Dependencies
- **Flask** Web framework 
- **PyJWT** JSON Web Token implementation 
- **python-dotenv** Loads environment variables from .env file

#### Setup

```sh
cd authentication
pip install -r requirements.txt
python app.py
# It starts on http://localhost:5000
```



### 2. Enter Data Service (App)

#### Languages
  - Frontend: html, Javascript, tailwindCSS
  - Backend: Python(Flask)
  - Database: **MySQL**
  
#### Features
  - Send credentials to the Authentication service
  - Users input
    1. Date
    2. Amount
    3. Category(food, transport, rent, etc)
    4. Payment Method(cash, credit card, debit card)
  - Expenses are stored in MySQL

#### Dependencies
- **Flask** Web framework 
- **PyJWT** JSON Web Token implementation 
- **python-dotenv** Loads environment variables from .env 
- **flask-cors**
- **mysql-connector-python**

#### Setup

```bash
cd enter_data/backend
pip install -r requirements.txt
python app.py
# It starts on http://localhost:5001

cd enter_data/frontend
# recommend run index.html with live server extension

# Pull and run MySQL from Docker Hub
docker login
docker pull swimminwebdev/expense-mysql-server:latest
docker run --name expense-mysql-server \
  -e MYSQL_ROOT_PASSWORD=Password1234 \
  -e MYSQL_DATABASE=expense_db \
  -e MYSQL_USER=mysqluser \
  -e MYSQL_PASSWORD=Password1 \
  -p 3306:3306 \
  -d swimminwebdev/expense-mysql-server:latest

# Verify data in MySQL
docker exec -it expense-mysql-server mysql -u mysqluser -p
USE expense_db;
SELECT * FROM expenses;
```


### 3. Analytics Service
#### Languages
  - Backend: Flask
  - Database: MongoDB

#### Features
  - Read data from **MySQL**
  - Get analytics
    1. Total spending
    2. Average spending per category
    3. Highest spending category
    4. Monthly Reports
  - Stores the results in **MongoDB**

#### Dependencies
- **Flask** Web framework 
- **python-dotenv** Loads environment variables from .env 
- **flask-cors**
- **pymongo**
- **pymysql**

#### Setup
```bash
# Pull and run MongoDB from Docker Hub
docker login
docker pull swimminwebdev/expense-mongo-server:latest 
docker run --name expense-mongo-server \ -p 27017:27017 \ -d swimminwebdev/expense-mongo-server:latest

# Verify data in MongoDB
docker exec -it expense-mongo-server mongosh
use analytics_db
show collections
# show data in analytics
db.analytics.find().pretty()

cd analytics
pip install -r requirements.txt
python app.py

# It starts on http://localhost:5003
```

### 4. Show Results Service (App)
#### Languages
  - Frontend: html, Javascript, tailwindCSS
  - Backend: Node.js 
  
#### Features
  - Send credentials to Authentication Service
  - Retrieves analytics from MongoDB

#### Dependencies (Backend)
- axios
- cors
- dotenv
- express
- mongodb

#### Setup
```sh
cd show_results/backend
npm install
node server.js
# It starts on http://localhost:5002

cd show_results/frontend
# recommend run index.html with live server extension
```
