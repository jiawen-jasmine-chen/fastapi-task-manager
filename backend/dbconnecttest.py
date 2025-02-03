from fastapi import FastAPI
import pymysql
import os

app = FastAPI()

@app.get("/")
def connect_db():
    try:
        connect = pymysql.connect(
            host="mysql",
            user = "root",
            password = os.getenv("MYSQL_ROOT_PASSWORD"),
            database="testdb",
            port=3306
        )
        with connect.cursor() as cursor:
            cursor.execute("SELECT * FROM users;")
            result = cursor.fetchall()
            
        return {"message": "Connected to MySQL", "data": result}

    except Exception as e:
        return {"error": str(e)}
        
@app.get("/test2")
def connect_db():
    try:
        connect = pymysql.connect(
            host="mysql",
            user = "root",
            password = os.getenv("MYSQL_ROOT_PASSWORD"),
            database="testdb",
            port=3306
        )
        with connect.cursor() as cursor:
            cursor.execute("SELECT * FROM users;")
            result = cursor.fetchall()
            
        return {"message": "Connected to MySQL number 2", "data": result}

    except Exception as e:
        return {"error": str(e)}
    