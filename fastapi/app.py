# app.py
from fastapi import FastAPI, Depends, HTTPException, status, Body
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from pydantic import BaseModel, EmailStr, constr
from passlib.context import CryptContext
from typing import List, Optional, Dict, Any
import os, json, math, time

# ------------------------------------------------------------------------------
# DB
# ------------------------------------------------------------------------------
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql+psycopg2://temp:temp@db:5432/database")
engine = create_engine(DATABASE_URL, future=True)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False, future=True)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ------------------------------------------------------------------------------
# App + CORS
# ------------------------------------------------------------------------------
app = FastAPI()

allow_origins = [o.strip() for o in os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",") if o.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# bcrypt_sha256 avoids bcrypt's 72-byte limit
pwd_ctx = CryptContext(schemes=["bcrypt_sha256"], deprecated="auto")

# ------------------------------------------------------------------------------
# Schemas (auth + telemetry)
# ------------------------------------------------------------------------------
class RegisterIn(BaseModel):
    first_name: constr(strip_whitespace=True, min_length=1) | None = None
    last_name:  constr(strip_whitespace=True, min_length=1) | None = None
    username:   constr(strip_whitespace=True, min_length=3, max_length=32) | None = None
    email: EmailStr
    password: constr(min_length=8)

class LoginIn(BaseModel):
    email: EmailStr
    password: constr(min_length=8)

class Vec3(BaseModel):
    x: float; y: float; z: float

class TelemetryOut(BaseModel):
    position: Vec3
    heading: Vec3
    velocity: Vec3
    accelerometer: Vec3
    trail: List[Vec3]
    timestamp: str

# ------------------------------------------------------------------------------
# Health
# ------------------------------------------------------------------------------
@app.get("/health")
def health():
    with engine.connect() as c:
        c.execute(text("SELECT 1"))
    return {"ok": True}

# ------------------------------------------------------------------------------
# Auth
# ------------------------------------------------------------------------------
@app.post("/auth/register", status_code=201)
@app.post("/auth/register/", status_code=201)
def register(payload: RegisterIn, db=Depends(get_db)):
    email = payload.email.strip().lower()
    username = (payload.username or "").strip().lower() or None

    # uniqueness checks
    if db.execute(text("SELECT 1 FROM users WHERE email=:e"), {"e": email}).first():
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered")
    if username and db.execute(text("SELECT 1 FROM users WHERE username=:u"), {"u": username}).first():
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Username already taken")

    pw_hash = pwd_ctx.hash(payload.password)
    db.execute(
        text("""
            INSERT INTO users (first_name, last_name, username, email, password_hash)
            VALUES (:f, :l, :u, :e, :p)
        """),
        {"f": payload.first_name, "l": payload.last_name, "u": username, "e": email, "p": pw_hash},
    )
    db.commit()
    return {"ok": True}

@app.post("/auth/login")
@app.post("/auth/login/")
def login(payload: LoginIn, db=Depends(get_db)):
    email = payload.email.strip().lower()
    row = db.execute(
        text("""SELECT id, first_name, last_name, username, email, password_hash
               FROM users WHERE email=:e"""),
        {"e": email}
    ).mappings().first()

    if not row or not pwd_ctx.verify(payload.password, row["password_hash"]):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    return {
        "ok": True,
        "user": {
            "id": row["id"],
            "first_name": row["first_name"],
            "last_name": row["last_name"],
            "username": row["username"],
            "email": row["email"],
        }
    }

# ------------------------------------------------------------------------------
# Paths (tolerant save + JSON cast fix)
# ------------------------------------------------------------------------------
def _coerce_wp(w):
    """Accept {x,y,z}, {x,y}, [x,y], [x,y,z]; fill z=0 if missing."""
    if isinstance(w, dict):
        return {"x": float(w.get("x", 0)), "y": float(w.get("y", 0)), "z": float(w.get("z", 0))}
    if isinstance(w, (list, tuple)):
        if len(w) < 2:
            raise ValueError("waypoint needs at least [x,y]")
        x, y = w[0], w[1]
        z = w[2] if len(w) >= 3 else 0
        return {"x": float(x), "y": float(y), "z": float(z)}
    raise ValueError("unsupported waypoint shape")

@app.post("/paths")
@app.post("/paths/")
def save_path(payload: dict = Body(...), db=Depends(get_db)):
    """
    Accepts:
      {
        "name": "warehouse-scan",
        "params": {...},                # optional
        "waypoints": [ {x,y,z}, {x,y}, ... ]  or  [[x,y,z], [x,y], ...]
      }
    """
    name = str(payload.get("name") or "path")
    params = payload.get("params") or {}
    raw = payload.get("waypoints") or payload.get("points") or []

    if not isinstance(raw, list) or not raw:
        raise HTTPException(status_code=422, detail="waypoints must be a non-empty list")

    try:
        waypoints = [_coerce_wp(w) for w in raw]
    except Exception as e:
        raise HTTPException(status_code=422, detail=f"invalid waypoint: {e}")

    # Use CAST(:param AS JSONB) so bind params are always recognized
    db.execute(
        text("""
            INSERT INTO paths (user_email, name, params, waypoints)
            VALUES (:u, :n, CAST(:p AS JSONB), CAST(:w AS JSONB))
        """),
        {"u": None, "n": name, "p": json.dumps(params), "w": json.dumps(waypoints)},
    )
    db.commit()
    return {"ok": True, "count": len(waypoints)}

@app.get("/paths")
@app.get("/paths/")
def list_paths(limit: int = 10, email: Optional[str] = None, db=Depends(get_db)):
    q = """
        SELECT id, user_email, name, params, waypoints, created_at
        FROM paths
        {where}
        ORDER BY created_at DESC
        LIMIT :lim
    """
    where = "WHERE user_email = :email" if email else ""
    rows = db.execute(text(q.format(where=where)), {"lim": limit, "email": email}).mappings().all()
    return {"items": rows}

# ------------------------------------------------------------------------------
# Telemetry (stub)
# ------------------------------------------------------------------------------
@app.get("/telemetry/latest", response_model=TelemetryOut)
@app.get("/telemetry/latest/", response_model=TelemetryOut)
def telemetry_latest():
    trail = [
        {"x": math.sin(i/5)*i/50, "y": math.cos(i/6)*i/60, "z": math.sin(i/7)*0.6}
        for i in range(1, 300)
    ]
    return {
        "position": trail[-1],
        "heading": {"x": 0.10, "y": 0.00, "z": 0.20},
        "velocity": {"x": 0.40, "y": -0.10, "z": 0.00},
        "accelerometer": {"x": 0.02, "y": 0.01, "z": 0.98},
        "trail": trail,
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
    }

# ------------------------------------------------------------------------------
# Stats (DB dashboard)
# ------------------------------------------------------------------------------
@app.get("/stats/overview")
@app.get("/stats/overview/")
def stats_overview(db=Depends(get_db)) -> Dict[str, Any]:
    users_count = db.execute(text("SELECT COUNT(*) FROM users")).scalar_one()
    paths_count = db.execute(text("SELECT COUNT(*) FROM paths")).scalar_one()

    users_last7 = db.execute(text("""
        WITH days AS (
          SELECT generate_series((CURRENT_DATE - INTERVAL '6 day')::date,
                                 CURRENT_DATE::date, '1 day') AS d)
        SELECT d::date AS day, COALESCE(COUNT(u.*),0) AS cnt
        FROM days LEFT JOIN users u ON u.created_at::date = d::date
        GROUP BY day ORDER BY day;
    """)).mappings().all()

    paths_last7 = db.execute(text("""
        WITH days AS (
          SELECT generate_series((CURRENT_DATE - INTERVAL '6 day')::date,
                                 CURRENT_DATE::date, '1 day') AS d)
        SELECT d::date AS day, COALESCE(COUNT(p.*),0) AS cnt
        FROM days LEFT JOIN paths p ON p.created_at::date = d::date
        GROUP BY day ORDER BY day;
    """)).mappings().all()

    recent_users = db.execute(text("""
        SELECT id, first_name, last_name, username, email, created_at
        FROM users ORDER BY created_at DESC NULLS LAST LIMIT 5;
    """)).mappings().all()

    recent_paths = db.execute(text("""
        SELECT id, name, created_at,
               COALESCE(jsonb_array_length(waypoints), 0) AS points
        FROM paths ORDER BY created_at DESC NULLS LAST LIMIT 5;
    """)).mappings().all()

    return {
        "users_count": users_count,
        "paths_count": paths_count,
        "users_last7_by_day": users_last7,
        "paths_last7_by_day": paths_last7,
        "recent_users": recent_users,
        "recent_paths": recent_paths,
    }
