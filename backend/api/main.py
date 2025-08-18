# backend/api/main.py
from pathlib import Path
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os, psycopg, logging
from psycopg.rows import dict_row

# Load .env from same folder as this file
load_dotenv(dotenv_path=Path(__file__).with_name(".env"))
DB_URL = os.getenv("DATABASE_URL", "")

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in os.getenv("ALLOWED_ORIGINS","").split(",") if o],
    allow_credentials=True, allow_methods=["*"], allow_headers=["*"],
)

@app.get("/health")
def health():
    with psycopg.connect(DB_URL) as conn:
        conn.execute("SELECT 1")
    return {"status": "ok", "db": "up"}

@app.get("/areas")
def list_areas(limit: int = Query(50, ge=1, le=500), offset: int = 0):
    with psycopg.connect(DB_URL, row_factory=dict_row) as conn:
        rows = conn.execute(
            """
            SELECT a.area_id, a.name, a.kind,
                   COALESCE(s.score, 0) AS score,
                   s.theme_air, s.theme_water, s.theme_hazard,
                   s.computed_at
            FROM public.areas a
            LEFT JOIN public.scores_current s USING (area_id)
            ORDER BY a.area_id
            LIMIT %s OFFSET %s
            """,
            (limit, offset),
        ).fetchall()
    return {"items": rows, "limit": limit, "offset": offset, "count": len(rows)}

@app.get("/areas/{area_id}")
def get_area(area_id: str):
    try:
        with psycopg.connect(DB_URL, row_factory=dict_row) as conn:
            row = conn.execute(
                """
                SELECT a.area_id, a.name, a.kind,
                       COALESCE(s.score, 0) AS score,
                       s.theme_air, s.theme_water, s.theme_hazard,
                       s.computed_at
                FROM public.areas a
                LEFT JOIN public.scores_current s USING (area_id)
                WHERE a.area_id = %s
                """,
                (area_id,),
            ).fetchone()
    except Exception as e:
        logging.exception("DB error")
        raise HTTPException(status_code=500, detail=f"DB error: {type(e).__name__}: {e}")

    if not row:
        raise HTTPException(status_code=404, detail="Area not found")
    return row

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", reload=True)
