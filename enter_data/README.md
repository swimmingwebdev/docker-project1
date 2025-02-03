# Enter Data Service

## Features
- User authentication
- Expense management 
  - Add new expenses
  - Categories: food, transport, rent, entertainment
  - Payment methods: cash, credit, debit
  

### Running with the authentication service and mysql

1. Start Authentication Service
```bash
pip install -r requirements.txt
python app.py
```
2. Start Enter Data service
```bash
pip install -r requirements.txt
python app.py
```

3. Run MySQL server
- log in to Docker
  `docker login`

-  Pull and run MySQL from Docker Hub\ 
```bash
  docker pull swimminwebdev/expense-mysql-server:latest

  docker run --name expense-mysql-server \
    -e MYSQL_ROOT_PASSWORD=Password1234 \
    -e MYSQL_DATABASE=expense_db \
    -e MYSQL_USER=mysqluser \
    -e MYSQL_PASSWORD=Password1 \
    -p 3306:3306 \
    -d swimminwebdev/expense-mysql-server:latest
```

4. Verify data in MySQL
```bash
docker exec -it expense-mysql-server mysql -u mysqluser -p
USE expense_db;
SELECT * FROM expenses;
```