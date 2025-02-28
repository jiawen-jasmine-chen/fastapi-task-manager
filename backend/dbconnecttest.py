from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel


import pymysql
import os
import random
import string
from datetime import date




def generate_invite_code():
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=5))


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8081"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class TaskCreate(BaseModel):
    description: str
    assignee: int | None = None
    due_date: date | None = None
    todolist_id: int
    owner_id: int

class TaskUpdate(BaseModel):
    description: str | None = None
    assignee: int | None = None
    due_date: date | None = None
    progress: str | None = None 
    
    
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


# @app.post("/users")
# def create_user(username: str):
#     try:
#         connection = get_db_connection()
#         with connection.cursor() as cursor:
#             cursor.execute("INSERT INTO User (Username) VALUES (%s);",(username,))
#             connection.commit()
#         connection.close()
#         return {"message": "User created successfully","username":username}
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=str(e))


@app.post("/register")
def register_user(username: str):
    connection = get_db_connection()
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT UserID FROM User WHERE Username = %s;", (username,))
            existing_user = cursor.fetchone()

            if existing_user:
                return {"success": False, "message": "Username already exists"}

            cursor.execute("INSERT INTO User (Username) VALUES (%s);", (username,))
            connection.commit()

            user_id = cursor.lastrowid

        return {"success": True, "user_id": user_id, "message": "Registration successful"}
    
    except Exception as e:
        connection.rollback()  
        raise HTTPException(status_code=500, detail=f"Error during registration: {str(e)}")

    finally:
        connection.close()  


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
        connection.close()  



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
            cursor.execute("SELECT ToDoListID, SharedFlag, UserID FROM ToDoList WHERE UserID = %s;", (user_id,))
            lists = cursor.fetchall()

        connection.close()

       
        if not lists:
            raise HTTPException(status_code=404, detail=f"No ToDoLists found for user_id {user_id}")

        
        formatted_lists = [{"id": l[0], "shared": l[1], "userId": l[2]} for l in lists]

        return {"todolists": formatted_lists}

    except HTTPException as e:
        raise e  
    except Exception as e:
        
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

    
@app.post("/todolists")
def create_todolist(user_id,shared):
    try:
        connection = get_db_connection()
        invite_code = generate_invite_code() if shared else None
        
        with connection.cursor() as cursor:
            cursor.execute("INSERT INTO ToDoList (SharedFlag, UserID, InviteCode) VALUES(%s, %s, %s);",(shared,user_id,invite_code))
            connection.commit()
            
            todolist_id = cursor.lastrowid
        connection.close()
        return {"message": "Todo list successfully created!","todolist_id":todolist_id,"invite_code":invite_code}
    except Exception as e:
        raise HTTPException(status_code=500,detail = str(e))   
    
@app.post("/todolists/join")
def join_todolist(user_id:int,invite_code:str):
    try:
        connection = get_db_connection()
        with connection.cursor() as cursor:
            cursor.execute("SELECT ToDoListID FROM ToDoList WHERE InviteCode = %s;",(invite_code,))
            todolist = cursor.fetchone()
            if not todolist:
                raise HTTPException(status_code=404,detail="Invite code not found")
            todolist_id = todolist[0]
            cursor.execute("SELECT * FROM ToDoListShare WHERE ToDoListID = %s AND UserID = %s;",(todolist_id,user_id))
            existing = cursor.fetchone()
            
            if existing:    
                return {"message":"User already in the list"}
            
            cursor.execute("""
                INSERT INTO ToDoListShare (ToDoListID, UserID)
                VALUES (%s, %s);
            """, (todolist_id, user_id))
            connection.commit()
        connection.close()
        
        return {"message":"User successfully added to the list"}
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
            print("🔍 Inserting Task:", task.dict())  # ✅ 打印调试信息

            # 修正 SQL 语句，确保所有字段正确传递
            sql = """
                INSERT INTO Task (Description, Progress, Assignee, DateDue, ToDoListID, OwnerID)
                VALUES (%s, %s, %s, %s, %s, %s);
            """
            values = (
                task.description,
                task.progress if task.progress else "Uncompleted",  # ✅ 确保 progress 有默认值
                task.assignee if task.assignee is not None else None,  # ✅ 允许 Assignee 为空
                task.due_date if task.due_date else None,  # ✅ 允许 DueDate 为空
                task.todolist_id,
                task.owner_id
            )

            cursor.execute(sql, values)  # ✅ 修复 SQL 语句
            connection.commit()
            
            task_id = cursor.lastrowid
            cursor.execute("""
                SELECT TaskID, Description, Progress, Assignee, DateDue, DateCreated, ToDoListID, OwnerID
                FROM Task WHERE TaskID = %s
            """, (task_id,))

            cols = [x[0] for x in cursor.description]
            new_task = cursor.fetchone()

        connection.close()
        return {"message": "Task created successfully", "task": dict(zip(cols, new_task))}
    
    except Exception as e:
        print("❌ Error inserting task:", str(e))  # ✅ 打印具体错误
        raise HTTPException(status_code=500, detail=str(e))


@app.put("/tasks/{task_id}")
def update_task(task_id: int, task_update: TaskUpdate):
    try:
        connection = get_db_connection()
        with connection.cursor() as cursor:
            cursor.execute("SELECT * FROM Task WHERE TaskID = %s;", (task_id,))
            existing_task = cursor.fetchone()
            if not existing_task:
                raise HTTPException(status_code=404, detail="Task not found")

            update_fields = []
            update_values = []

            if task_update.description is not None:
                update_fields.append("Description = %s")
                update_values.append(task_update.description)
            if task_update.assignee is not None:
                update_fields.append("Assignee = %s")
                update_values.append(task_update.assignee)
            if task_update.due_date is not None:
                update_fields.append("DateDue = %s")
                update_values.append(task_update.due_date)
            if task_update.progress is not None:
                if task_update.progress not in ["Uncompleted", "Completed"]:
                    raise HTTPException(status_code=400, detail="Invalid progress value")
                update_fields.append("Progress = %s")
                update_values.append(task_update.progress)

            if not update_fields:
                raise HTTPException(status_code=400, detail="No fields to update")

            update_values.append(task_id)
            sql_query = f"UPDATE Task SET {', '.join(update_fields)} WHERE TaskID = %s;"
            cursor.execute(sql_query, tuple(update_values))
            connection.commit()

            cursor.execute("SELECT TaskID, Description, COALESCE(Assignee, 0), COALESCE(DateDue, '0000-00-00'), COALESCE(Progress, 'Uncompleted') FROM Task WHERE TaskID = %s;", (task_id,))
            updated_task = cursor.fetchone()

        connection.close()
        return {"message": "Task updated successfully", "task": updated_task}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
