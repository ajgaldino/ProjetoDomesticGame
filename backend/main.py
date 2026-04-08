from fastapi import FastAPI, HTTPException, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
import os
import secrets
import string
from typing import List, Optional
from datetime import datetime
from dotenv import load_dotenv

from database import get_supabase
from schemas import (
    UserRegister, UserLogin, GroupCreate, GroupResponse,
    TaskBase, TaskCreate, TaskResponse, TaskUpdate, ApprovalCreate, ProfileResponse
)

load_dotenv()

app = FastAPI(title="DomesticQuest API", version="1.0.0")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- HELPERS ---
def generate_join_code(length=6):
    characters = string.ascii_uppercase + string.digits
    return ''.join(secrets.choice(characters) for _ in range(length))

async def get_current_user(authorization: str = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Token não fornecido ou inválido")
    
    token = authorization.split(" ")[1]
    supabase = get_supabase()
    
    # Verify token with Supabase
    user = supabase.auth.get_user(token)
    if not user:
        raise HTTPException(status_code=401, detail="Usuário não autenticado")
    
    return user.user

# --- ROUTES ---

@app.get("/")
async def root():
    return {"message": "DomesticQuest API Online", "time": datetime.now()}

# AUTH
@app.post("/auth/register")
async def register(user_data: UserRegister):
    supabase = get_supabase()
    try:
        # 1. Create User in Supabase Auth
        res = supabase.auth.sign_up({
            "email": user_data.email,
            "password": user_data.password,
            "options": {"data": {"username": user_data.username}}
        })
        
        if not res.user:
            raise HTTPException(status_code=400, detail="Erro ao criar usuário")

        # 2. Create Profile in public.profiles
        supabase.table("profiles").insert({
            "id": res.user.id,
            "username": user_data.username,
            "full_name": user_data.full_name
        }).execute()
        
        return {"message": "Usuário registrado com sucesso!", "user_id": res.user.id}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/auth/login")
async def login(user_data: UserLogin):
    supabase = get_supabase()
    try:
        res = supabase.auth.sign_in_with_password({
            "email": user_data.email,
            "password": user_data.password
        })
        return res
    except Exception as e:
        raise HTTPException(status_code=401, detail="Credenciais inválidas")

# GROUPS
@app.post("/groups", response_model=GroupResponse)
async def create_group(group_data: GroupCreate, user=Depends(get_current_user)):
    supabase = get_supabase()
    join_code = generate_join_code()
    
    try:
        # Create group
        res = supabase.table("groups").insert({
            "name": group_data.name,
            "join_code": join_code
        }).execute()
        
        group = res.data[0]
        
        # Assign user to group
        supabase.table("profiles").update({"current_group_id": group["id"]}).eq("id", user.id).execute()
        
        return group
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/groups/join/{code}")
async def join_group(code: str, user=Depends(get_current_user)):
    supabase = get_supabase()
    try:
        res = supabase.table("groups").select("*").eq("join_code", code.upper()).execute()
        if not res.data:
            raise HTTPException(status_code=404, detail="Código de casa inválido")
        
        group = res.data[0]
        supabase.table("profiles").update({"current_group_id": group["id"]}).eq("id", user.id).execute()
        
        return {"message": f"Você entrou na casa {group['name']}!", "group_id": group["id"]}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# TASKS
@app.get("/tasks", response_model=List[TaskResponse])
async def list_tasks(user=Depends(get_current_user)):
    supabase = get_supabase()
    # Get user profile to find group_id
    profile = supabase.table("profiles").select("current_group_id").eq("id", user.id).single().execute()
    group_id = profile.data["current_group_id"]
    
    if not group_id:
        return []
        
    res = supabase.table("tasks").select("*").eq("group_id", group_id).eq("status", "active").execute()
    return res.data

@app.get("/tasks/pending", response_model=List[TaskResponse])
async def list_pending_tasks(user=Depends(get_current_user)):
    supabase = get_supabase()
    profile = supabase.table("profiles").select("current_group_id").eq("id", user.id).single().execute()
    group_id = profile.data["current_group_id"]
    
    if not group_id:
        return []
        
    res = supabase.table("tasks").select("*").eq("group_id", group_id).eq("status", "pending_approval").execute()
    return res.data

@app.post("/tasks", response_model=TaskResponse)
async def create_task(task_data: TaskCreate, user=Depends(get_current_user)):
    supabase = get_supabase()
    res = supabase.table("tasks").insert({
        **task_data.dict(),
        "proposed_by": user.id,
        "status": "active"
    }).execute()
    return res.data[0]

@app.post("/tasks/propose")
async def propose_new_task(task_data: TaskCreate, user=Depends(get_current_user)):
    supabase = get_supabase()
    res = supabase.table("tasks").insert({
        **task_data.dict(),
        "proposed_by": user.id,
        "status": "pending_approval"
    }).execute()
    return res.data[0]

@app.post("/tasks/{task_id}/complete")
async def complete_task(task_id: str, photo_url: Optional[str] = None, user=Depends(get_current_user)):
    supabase = get_supabase()
    # 1. Get task details
    task = supabase.table("tasks").select("*").eq("id", task_id).single().execute()
    if not task.data:
        raise HTTPException(status_code=404, detail="Tarefa não encontrada")
    
    # 2. Record completion
    supabase.table("completed_tasks").insert({
        "group_id": task.data["group_id"],
        "user_id": user.id,
        "task_id": task_id,
        "task_name": task.data["name"],
        "points_earned": task.data["points"],
        "photo_url": photo_url
    }).execute()
    
    # 3. Update User Points (Simple implementation)
    supabase.rpc("increment_user_points", {"user_id": user.id, "points": task.data["points"]}).execute()
    
    return {"message": "Tarefa concluída! Pontos creditados.", "points": task.data["points"]}

# TASKS - PROPOSALS
@app.post("/tasks/{task_id}/propose-update")
async def propose_task_update(task_id: str, updates: TaskUpdate, user=Depends(get_current_user)):
    supabase = get_supabase()
    # 1. Create a clone of the task with status 'pending_approval' and 'original_task_id'
    # Actually, let's just use the 'tasks' table with a status
    task = supabase.table("tasks").select("*").eq("id", task_id).single().execute()
    if not task.data:
        raise HTTPException(status_code=404, detail="Tarefa não encontrada")

    # Create new task entry linked to original or just update status?
    # Better: New entry to keep history and allow rejection without losing original
    res = supabase.table("tasks").insert({
        "group_id": task.data["group_id"],
        "name": updates.name or task.data["name"],
        "points": updates.points or task.data["points"],
        "description": updates.description or task.data["description"],
        "status": "pending_approval",
        "proposed_by": user.id
    }).execute()
    
    return {"message": "Proposta enviada para validação dos outros moradores.", "id": res.data[0]["id"]}

@app.post("/tasks/{task_id}/approve")
async def approve_task(task_id: str, approval: ApprovalCreate, user=Depends(get_current_user)):
    supabase = get_supabase()
    # 1. Register vote
    supabase.table("task_approvals").upsert({
        "task_id": task_id,
        "user_id": user.id,
        "decision": approval.decision
    }).execute()
    
    # 2. Check if enough approvals (simplified: first approval by someone else activates it)
    # In a real app, you'd check if count(approvals) > members/2
    if approval.decision == 'approve':
        task = supabase.table("tasks").select("*").eq("id", task_id).single().execute()
        if task.data and task.data["proposed_by"] != user.id:
            supabase.table("tasks").update({"status": "active"}).eq("id", task_id).execute()
            # If it was an update of an old task, you might want to archive the old one here.
    
    return {"message": "Voto registrado!"}

# RANKING
@app.get("/ranking", response_model=List[ProfileResponse])
async def get_ranking(user=Depends(get_current_user)):
    supabase = get_supabase()
    profile = supabase.table("profiles").select("current_group_id").eq("id", user.id).single().execute()
    group_id = profile.data["current_group_id"]
    
    if not group_id:
        return []

    res = supabase.table("profiles").select("*").eq("current_group_id", group_id).order("total_points", desc=True).execute()
    return res.data

# HISTORY
@app.get("/tasks/history")
async def get_history(limit: int = 20, user=Depends(get_current_user)):
    supabase = get_supabase()
    profile = supabase.table("profiles").select("current_group_id").eq("id", user.id).single().execute()
    group_id = profile.data["current_group_id"]
    
    if not group_id:
        return []

    res = supabase.table("completed_tasks") \
        .select("*, profiles(username)") \
        .eq("group_id", group_id) \
        .order("timestamp", desc=True) \
        .limit(limit) \
        .execute()
    return res.data

# JSON IMPORT
@app.post("/tasks/import")
async def import_tasks(tasks: List[TaskBase], user=Depends(get_current_user)):
    supabase = get_supabase()
    profile = supabase.table("profiles").select("current_group_id").eq("id", user.id).single().execute()
    group_id = profile.data["current_group_id"]
    
    if not group_id:
        raise HTTPException(status_code=400, detail="Você precisa estar em uma casa para importar tarefas")
    
    data_to_insert = [
        {**t.dict(), "group_id": group_id, "status": "active", "proposed_by": user.id}
        for t in tasks
    ]
    
    res = supabase.table("tasks").insert(data_to_insert).execute()
    return {"message": f"{len(res.data)} tarefas importadas com sucesso!"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
