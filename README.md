### ACIT3495 - Project1

#### Group3 
- Team members
  - Austin Park
  - Keziah Wacnang
  - Yang Jung

### Data Collection and Analytics System (Daily Expense Tracker)
##  System Overview
#### 1. Enter Data Service (App)
- Languages
  - Frontend: ReactJS with tailwind
  - Backend: Flask
  - Database: MySQL
- Features
  - Send credentials to the Authentication service
  - Users input
    1. Date
    2. Amount
    3. Category(food, transport, rent, etc)
    4. Payment Method(cash, credit card, debit card)
  - Expenses are stored in MySQL

#### 2. Show Results Service (App)
- Languages
  - Frontend: ReactJS with tailwind
  - Backend: NodeJS 
- Features
  - Send credentials to Authentication Service
  - Retrieves analytics from MongoDB

#### 3. Authentication Service
- Languages
  - Backend: Flask
- Features
  - Validate user credentials
  - issue JWT tokens

#### 4. Analytics Service
- Languages
  - Backend: Flask
  - Database: MongoDB
- Features
  - Read data from MySQL
  - Get analytics
    1. Total spending
    2. Average spending per category
    3. Highest spending category
    4. Monthly Reports
  - Stores the results in MongoDB

## Test services
1. Authentication Service (port 5000):

```bash
cd authentication
python app.py
```

2. Enter Data Service
  - Frontend (port 5173)
  ```bash
  cd enter_data/frontend
  npm run dev
  ```
  - Backend(port 5001)
  ```bash
    cd enter_data/backend
    python app.py
  ``` 