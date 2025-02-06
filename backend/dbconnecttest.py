from fastapi import FastAPI, HTTPException
import pymysql
import os

app = FastAPI()


def get_db_connection():
    return pymysql.connect(
        host = 'mysql',
        user = 'root',
        password = os.getenv("MYSQL_ROOT_PASSWORD"),
        database = 'tododb',
        port=3306
    )

@app.get("/users")
def get_users():
    try:
        connection = get_db_connection()
        with connection.cursor() as cursor:
            cursor.execute("SELECT * from User;")
            users = cursor.fetchall()
        connection.close()
        return {"users":users}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/users")
def create_user(username):
    try:
        connection = get_db_connection()
        with connection.cursor() as cursor:
            cursor.execute("INSERT INTO User (Username) VALUES (%s);",(username,))
            connection.commit()
        connection.close()
        return {"message": "User created successfully","username":username}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    

@app.get("/todolists/{user_id}")
def get_todolists(user_id):
    try:
        connection = get_db_connection()
        with connection.cursor() as cursor:
            cursor.execute("SELECT * FROM ToDoList WHERE UserID = %s;",(user_id,))
            lists = cursor.fetchall()
        connection.close()
        return{"todolists":lists}
    except Exception as e:
        raise HTTPException(status_code=500,detail = str(e))
    
@app.post("/todolists")
def create_todolist(user_id,shared):
    try:
        connection = get_db_connection()
        with connection.cursor() as cursor:
            cursor.execute("INSERT INTO ToDoList (SharedFlag, UserID) VALUES(%s, %s);",(shared,user_id))
            connection.commit()
        connection.close()
        return {"message": "Todo list successfully created!"}
    except Exception as e:
        raise HTTPException(status_code=500,detail = str(e))   
    
    
@app.get("/tasks/{todolist_id}")
def get_tasks(todolist_id):
    try:
        connection = get_db_connection()
        with connection.cursor() as cursor:
            cursor.execute("SELECT * from Task WHERE ToDoListID = %s;",(todolist_id,))
            tasks = cursor.fetchall()
        connection.close()
        return {"tasks":tasks}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@app.post("/tasks")
def create_task(description, assignee, due_date, todolist_id,owner_id):
    try:
        connection = get_db_connection()
        with connection.cursor() as cursor:
            cursor.execute("""
                INSERT INTO Task (Description, Progress, Assignee, DateDue, ToDoListID, OwnerID)
                VALUES (%s, 'Not Started', %s, %s, %s, %s);
            """, (description, assignee, due_date, todolist_id, owner_id))
            connection.commit()
        connection.close()
        return {"message":"Task created successfully"}
    except Exception as e:
        raise HTTPException(status_code=500,detail=str(e))
    

    