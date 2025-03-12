from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel


import pymysql
import os
import random
import string
from datetime import date

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
    progress: str = "Uncompleted"

class TaskUpdate(BaseModel):
    description: str | None = None
    assignee: int | None = None
    due_date: date | None = None
    progress: str | None = None 

class LeaveListRequest(BaseModel):
    user_id: int
    
    
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
            cursor.execute("SELECT UserID, Username FROM User;")
            users = cursor.fetchall()
        connection.close()
        return {"users": [{"UserID": u[0], "Username": u[1]} for u in users]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


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






@app.get("/todolists/{user_id}")
def get_todolists(user_id: int):
    try:
        connection = get_db_connection()
        with connection.cursor() as cursor:
            
            cursor.execute("""
                SELECT ToDoListID, Name, SharedFlag, UserID, InviteCode 
                FROM ToDoList 
                WHERE UserID = %s;
            """, (user_id,))
            owned_lists = cursor.fetchall()
            
            cursor.execute("""
                SELECT ToDoList.ToDoListID, ToDoList.Name, ToDoList.SharedFlag, ToDoList.UserID, ToDoList.InviteCode 
                FROM ToDoList 
                JOIN ToDoListShare ON ToDoList.ToDoListID = ToDoListShare.ToDoListID 
                WHERE ToDoListShare.UserID = %s AND ToDoList.UserID != %s;
            """, (user_id, user_id))
            shared_lists = cursor.fetchall()
            
        connection.close()
        
        todolists = [
            {"id": l[0], "name": l[1], "shared": bool(l[2]), "owner_id": l[3], "inviteCode": l[4]}
            for l in owned_lists + shared_lists
        ]
        
        return {"todolists": todolists}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


    
@app.post("/todolists")
def create_todolist(user_id: int, shared: int, name: str):
    try:
        connection = get_db_connection()
        invite_code = generate_invite_code() if shared == 1 else None

        with connection.cursor() as cursor:
            cursor.execute("INSERT INTO ToDoList (SharedFlag, UserID, Name, InviteCode) VALUES (%s, %s, %s, %s);",
                           (shared, user_id, name, invite_code))
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
        raise HTTPException(status_code=500, detail=str(e))

    
@app.post("/todolists/join")
def join_todolist(user_id: int, invite_code: str):
    try:
        connection = get_db_connection()
        with connection.cursor() as cursor:
            cursor.execute("SELECT ToDoListID FROM ToDoList WHERE InviteCode = %s;", (invite_code,))
            todolist = cursor.fetchone()
            if not todolist:
                raise HTTPException(status_code=404, detail="Invite code not found")
            todolist_id = todolist[0]

            cursor.execute("SELECT * FROM ToDoListShare WHERE ToDoListID = %s AND UserID = %s;", (todolist_id, user_id))
            existing = cursor.fetchone()
            if existing:
                return {"message": "User already in the list"}

            cursor.execute("INSERT INTO ToDoListShare (ToDoListID, UserID) VALUES (%s, %s);", (todolist_id, user_id))
            connection.commit()
        connection.close()
        return {"message": "User successfully added to the list"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@app.get("/todolists/{todolist_id}/users")
def get_users_with_access(todolist_id: int):
    try:
        connection = get_db_connection()
        with connection.cursor() as cursor:
            
            cursor.execute("""
                SELECT User.UserID, User.Username 
                FROM User 
                JOIN ToDoList ON User.UserID = ToDoList.UserID 
                WHERE ToDoList.ToDoListID = %s;
            """, (todolist_id,))
            owner = cursor.fetchone()
            
            cursor.execute("""
                SELECT User.UserID, User.Username 
                FROM User 
                JOIN ToDoListShare ON User.UserID = ToDoListShare.UserID 
                WHERE ToDoListShare.ToDoListID = %s;
            """, (todolist_id,))
            shared_users = cursor.fetchall()
            
        connection.close()
        
        users_with_access = []
        
        if owner:
            users_with_access.append({"id": owner[0], "username": owner[1], "role": "owner"})
        
        users_with_access.extend([{"id": u[0], "username": u[1], "role": "member"} 
                                  for u in shared_users])
        
        return {"users": users_with_access}
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
    
@app.get("/tasks/{todolist_id}")
def get_tasks(todolist_id: int):
    try:
        connection = get_db_connection()
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT Task.TaskID, Task.Description, Task.Progress, User.Username AS AssigneeName, Task.DateDue, Task.DateCreated, Task.ToDoListID, Task.OwnerID 
                FROM Task 
                LEFT JOIN User ON Task.Assignee = User.UserID 
                WHERE Task.ToDoListID = %s;
            """, (todolist_id,))
            tasks = cursor.fetchall()
        connection.close()
        return {"tasks": [{"id": t[0], "description": t[1], "progress": t[2], "assignee": t[3], "due_date": t[4], "created_at": t[5], "todolist_id": t[6], "owner_id": t[7]} for t in tasks]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    
@app.post("/tasks")
def create_task(task: TaskCreate):
    try:
        connection = get_db_connection()
        with connection.cursor() as cursor:
            sql = """
                INSERT INTO Task (Description, Progress, Assignee, DateDue, ToDoListID, OwnerID)
                VALUES (%s, %s, %s, %s, %s, %s);
            """
            values = (
                task.description,
                task.progress if task.progress else "Uncompleted",
                task.assignee if task.assignee is not None else None,
                task.due_date if task.due_date else None,
                task.todolist_id,
                task.owner_id
            )

            cursor.execute(sql, values)
            connection.commit()

            task_id = cursor.lastrowid
            cursor.execute("""
                SELECT TaskID, Description, Progress, Assignee, DateDue, DateCreated, ToDoListID, OwnerID
                FROM Task WHERE TaskID = %s
            """, (task_id,))
            new_task = cursor.fetchone()

        connection.close()
        return {"message": "Task created successfully", "task": dict(zip(["id", "description", "progress", "assignee", "due_date", "created_at", "todolist_id", "owner_id"], new_task))}
    except Exception as e:
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
    

@app.delete("/tasks/{task_id}")
def delete_task(task_id: int):
    try:
        connection = get_db_connection()
        with connection.cursor() as cursor:
            cursor.execute("SELECT * FROM Task WHERE TaskID = %s;", (task_id,))
            existing_task = cursor.fetchone()
            if not existing_task:
                raise HTTPException(status_code=404, detail="Task not found")

            cursor.execute("DELETE FROM Task WHERE TaskID = %s;", (task_id,))
            connection.commit()
        connection.close()
        return {"message": "Task deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/todolists/{todolist_id}")
def delete_todolist(todolist_id: int):
    try:
        connection = get_db_connection()
        with connection.cursor() as cursor:
            cursor.execute("SELECT * FROM ToDoList WHERE ToDoListID = %s;", (todolist_id,))
            existing_todolist = cursor.fetchone()
            if not existing_todolist:
                raise HTTPException(status_code=404, detail="Todo list not found")

            cursor.execute("DELETE FROM Task WHERE ToDoListID = %s;", (todolist_id,))
            cursor.execute("DELETE FROM ToDoListShare WHERE ToDoListID = %s;", (todolist_id,))
            cursor.execute("DELETE FROM ToDoList WHERE ToDoListID = %s;", (todolist_id,))
            connection.commit()
        connection.close()
        return {"message": "Todo list deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    

class LeaveListRequest(BaseModel):
    user_id: int

@app.post("/todolists/{todolist_id}/leave")
def leave_todolist(todolist_id: int, request: LeaveListRequest):
    try:
        connection = get_db_connection()
        with connection.cursor() as cursor:
            # Check if the user is a member of this shared list
            cursor.execute("""
                SELECT * FROM ToDoListShare 
                WHERE ToDoListID = %s AND UserID = %s
            """, (todolist_id, request.user_id))
            membership = cursor.fetchone()
            
            if not membership:
                raise HTTPException(status_code=404, detail="User is not a member of this list or list does not exist")
            
            # Remove user from the shared list
            cursor.execute("""
                DELETE FROM ToDoListShare 
                WHERE ToDoListID = %s AND UserID = %s
            """, (todolist_id, request.user_id))
            
            connection.commit()
            
        connection.close()
        return {"message": "Successfully left the shared list"}
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=f"Error leaving list: {str(e)}")