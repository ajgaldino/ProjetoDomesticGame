from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

# --- AUTH ---
class UserRegister(BaseModel):
    username: str
    email: EmailStr
    password: str
    full_name: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

# --- GROUPS ---
class GroupCreate(BaseModel):
    name: str

class GroupResponse(BaseModel):
    id: str
    name: str
    join_code: str
    created_at: datetime

# --- TASKS ---
class TaskBase(BaseModel):
    name: str
    description: Optional[str] = None
    points: int

class TaskCreate(BaseModel):
    name: str
    description: Optional[str] = None
    points: int
    group_id: str

class TaskUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    points: Optional[int] = None

class TaskResponse(BaseModel):
    id: str
    group_id: str
    name: str
    description: Optional[str] = None
    points: int
    status: str
    proposed_by: Optional[str] = None
    created_at: datetime

# --- VALIDATION ---
class ApprovalCreate(BaseModel):
    decision: str # 'approve' or 'reject'
    comment: Optional[str] = None

# --- RANKING ---
class ProfileResponse(BaseModel):
    id: str
    username: str
    total_points: int
    level: int
    title: str
    avatar_url: Optional[str] = None
