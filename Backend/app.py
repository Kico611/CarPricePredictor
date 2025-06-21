from fastapi import FastAPI
from routers import stats, visualization , predictions
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

origins = [
    "http://localhost:5173",  # adresa tvog React frontenda
    # možeš dodati i druge ako treba
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,        # tko smije pristupati
    allow_credentials=True,
    allow_methods=["*"],          # koje metode su dopuštene (GET, POST...)
    allow_headers=["*"],          # koja zaglavlja su dopuštena
)

# Registracija ruta iz modula
app.include_router(stats.router, prefix="/stats")
app.include_router(visualization.router, prefix="/visualization") 
app.include_router(predictions.router, prefix="/predictions")

@app.get("/")
def root():
    return {"msg": "FastAPI backend radi!"}
