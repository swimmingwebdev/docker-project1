# 📌 DEMO Checklist: Expense Tracker


## 1. Setup the Project

### Clone the repository
```sh
git clone https://github.com/swimmingwebdev/docker-project1.git
cd docker-project1
```

### Create the `.env` file


## 2. Start Services
### Run the containers
```sh
docker-compose up -d
```

### Verify all running containers
```sh
docker ps
```
**Containers**
1. MySQL 
2. MongoDB 
3. authentication
4. analytics
5. enter-data backend
6. enter-data frontend
7. show-results backend 
8. show-results frontend

**Check if database servers are in a healthy state**

We should explain
- 1. Why use health checks for databases?
  - Ensures database services are fully ready before dependent services start.
  - Prevents connection failures due to premature startup.

- 2. Why use environment variables in `docker-compose.yml`?
  - Prevents hardcoding credentials in the source code.
  - Enhances security.


## 3. Open the web applications
- **Enter Data Service** → [http://localhost:8080/](http://localhost:8080/)
- **Show Results Service** → [http://localhost:8081/](http://localhost:8081/)


## 4. Adding Expenses (Enter Data Service)
### **Login to Enter Data Service**
- **Username:** `myexpense`  
- **Password:** `Password1234`

### **Enter 4-5 expense entries**  

### **Verify Data is Stored in MySQL**
```sh
docker exec -it expense-mysql-server mysql -u mysqluser -p
```
- **Password:** `Password1`
```sql
USE expense_db;
SELECT * FROM expenses;
```

## 5. Login to Show Results Service
- **Username:** `myexpense`  
- **Password:** `Password1234`

### **Check the analytics data**

### **Update Analytics**
1. **Go back to Enter Data Service** and enter **1-2 more expenses**.
2. **Return to Show Results Service** and click the **"Update Results"** button.
3. **Verify that the analytics data updates correctly.**

## 6. Logout and Verify Restricted Access
- Click **logout** in the Show Results Service.
- Confirm that analytics data is no longer visible.

### **Try Adding Expenses While Logged Out**
- Go back to **Enter Data Service** and attempt to add an expense.
- **Expected behavior:** A message should appear prompting the user to **log in first**.


