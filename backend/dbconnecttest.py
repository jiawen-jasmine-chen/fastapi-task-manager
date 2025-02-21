from fastapi import FastAPI, HTTPException
import pymysql
import os
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from datetime import date

import random
import string

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8081"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def generate_invite_code():
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=5))

class TaskCreate(BaseModel):
    description: str
    assignee: int | None = None
    due_date: date | None = None
    todolist_id: int
    owner_id: int


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
def create_user(username: str):
    try:
        connection = get_db_connection()
        with connection.cursor() as cursor:
            cursor.execute("INSERT INTO User (Username) VALUES (%s);",(username,))
            connection.commit()
        connection.close()
        return {"message": "User created successfully","username":username}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/register")
def register_user(username: str):
    connection = get_db_connection()
    try:
        with connection.cursor() as cursor:
            # 检查用户名是否存在
            cursor.execute("SELECT UserID FROM User WHERE Username = %s;", (username,))
            existing_user = cursor.fetchone()

            if existing_user:
                return {"success": False, "message": "Username already exists"}

            # 插入新用户
            cursor.execute("INSERT INTO User (Username) VALUES (%s);", (username,))
            connection.commit()

            # 获取新用户 ID
            user_id = cursor.lastrowid

        return {"success": True, "user_id": user_id, "message": "Registration successful"}
    
    except Exception as e:
        connection.rollback()  # 遇到错误时回滚，避免脏数据
        raise HTTPException(status_code=500, detail=f"Error during registration: {str(e)}")

    finally:
        connection.close()  # 确保连接总是被关闭


@app.post("/login")
def login_user(username: str):
    connection = get_db_connection()
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT UserID FROM User WHERE Username = %s;", (username,))
            user = cursor.fetchone()

        if user:
            return {"success": True, "user_id": user[0], "message": "Login successful"}
        else:
            return {"success": False, "message": "User not found"}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error during login: {str(e)}")

    finally:
        connection.close()  # 确保数据库连接关闭



@app.get("/users/{user_id}")
def check_user(user_id: int):
    try:
        connection = get_db_connection()
        with connection.cursor() as cursor:
            cursor.execute("SELECT * FROM User WHERE UserID = %s;", (user_id,))
            existing_user = cursor.fetchone()
        connection.close()

        if existing_user:
            return {"exists": True, "user": existing_user, "message": "User exists"}
        else:
            return {"exists": False, "message": "User not found"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))




@app.get("/todolists/{user_id}")
def get_todolists(user_id: int):
    try:
        connection = get_db_connection()
        with connection.cursor() as cursor:
            cursor.execute("SELECT ToDoListID, Name, SharedFlag, UserID, InviteCode FROM ToDoList WHERE UserID = %s;", (user_id,))
            lists = cursor.fetchall()

        connection.close()

        # ✅ 如果 `lists` 为空，返回 404，而不是返回空列表
        if not lists:
            raise HTTPException(status_code=404, detail=f"No ToDoLists found for user_id {user_id}")

        # ✅ 转换数据结构
        formatted_lists = [{"id": l[0], "name": l[1], "shared": l[2], "userId": l[3], "inviteCode":l[4]} for l in lists]

        return {"todolists": formatted_lists}

    except HTTPException as e:
        raise e  # 直接抛出 FastAPI 的 HTTPException，保持原有错误代码
    except Exception as e:
        # ✅ 捕获所有其他错误，并返回 500
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

    
@app.post("/todolists")
def create_todolist(user_id,shared,name):
    try:
        connection = get_db_connection()
        invite_code = None
        with connection.cursor() as cursor:
            
            shared_flag = int(shared)
            
            if shared_flag == 1:
                invite_code = generate_invite_code()
            
            cursor.execute("INSERT INTO ToDoList (SharedFlag, UserID,Name,InviteCode) VALUES(%s, %s,%s,%s);",(shared,user_id,name,invite_code))
            connection.commit()
            todolist_id = cursor.lastrowid
        connection.close()
        
        return {
            "message": "Todo list successfully created!",
            "todolist_id": todolist_id,
            "name": name,
            "shared": shared,
            "inviteCode": invite_code
        }
    except Exception as e:
        raise HTTPException(status_code=500,detail = str(e))   
    
    
@app.get("/tasks/{todolist_id}")
def get_tasks(todolist_id: int):
    try:
        connection = get_db_connection()
        with connection.cursor() as cursor:
            cursor.execute("SELECT TaskID, Description, Progress, Assignee, DateDue, DateCreated, ToDoListID, OwnerID FROM Task WHERE ToDoListID = %s;", (todolist_id,))
            tasks = cursor.fetchall()
        
        connection.close()

        # ✅ 转换为 JSON 格式
        formatted_tasks = [
            {
                "id": t[0],
                "description": t[1],
                "progress": t[2],
                "assignee": t[3],
                "due_date": t[4],
                "created_at": t[5],
                "todolist_id": t[6],
                "owner_id": t[7],
            }
            for t in tasks
        ]

        return {"tasks": formatted_tasks}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    
@app.post("/tasks")
def create_task(task: TaskCreate):
    try:
        connection = get_db_connection()
        with connection.cursor() as cursor:
            cursor.execute("""
                INSERT INTO Task (Description, Progress, Assignee, DateDue, ToDoListID, OwnerID)
                VALUES (%s, 'Not Started', %s, %s, %s, %s);
            """, (task.description, task.assignee, task.due_date, task.todolist_id, task.owner_id))
            
            connection.commit()
            
            task_id = cursor.lastrowid
            
            cursor.execute("""
                SELECT TaskID, Description, Progress, Assignee, DateDue, DateCreated, ToDoListID, OwnerID
                FROM Task WHERE TaskID = %s
            """, (task_id,))
            
            cols = [x[0] for x in cursor.description]
            new_task = cursor.fetchone()
        connection.close()
        return {"message":"Task created successfully",
                "task": dict(zip(cols,new_task))}
    except Exception as e:
        raise HTTPException(status_code=500,detail=str(e))

    
@app.get("/taskstest")
def getTasksTest():
    try:
        connection = get_db_connection()
        with connection.cursor() as cursor:
            cursor.execute("SELECT * from taskTest")
            tasks = cursor.fetchall()
        connection.close()
        return {"tasks":tasks}
    except Exception as e:
        raise HTTPException(status_code=500,detail=str(e))
    
    
@app.post("/taskstest")
def createTaskTest(description,completed):
    try:
        connection = get_db_connection()
        with connection.cursor() as cursor:
            cursor.execute("INSERT into taskTest (Description,Completed) VALUES(%s,%s);",(description,completed))
            connection.commit()
        connection.close()
        return {"message": "Task created successfully"}
    except Exception as e:
        raise HTTPException(status_code=500,detail=str(e))

@app.put("/taskstest/{task_id}")
def markAsCompleted(task_id):
    try:
        connection = get_db_connection()
        with connection.cursor() as cursor:
            cursor.execute("UPDATE taskTest SET Completed = 1 WHERE ID = %s;",(task_id,))
            connection.commit()
        
        connection.close()
        return {"message": f"Task {task_id} marked as completed"}
    except Exception as e:
        raise HTTPException(status_code=500,detail=str(e))