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
    category: Optional[str] = 'other'

class TaskCreate(BaseModel):
    name: str
    description: Optional[str] = None
    points: int
    group_id: str
    category: Optional[str] = 'other'

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
    category: str
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
    exp_cleaning: int
    exp_org: int
    exp_cooking: int
    streak_count: int
    level: int
    title: str
    avatar_url: Optional[str] = None

# --- MARKETPLACE ---
class RewardResponse(BaseModel):
    id: str
    group_id: str
    title: str
    description: Optional[str] = None
    price_points: int
    is_default: bool
    created_at: datetime

class PurchaseCreate(BaseModel):
    reward_id: str

class PurchaseResponse(BaseModel):
    id: str
    reward_id: str
    user_id: str
    status: str
    purchased_at: datetime
    reward: Optional[RewardResponse] = None
