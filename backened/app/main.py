from fastapi import FastAPI
from app.routes import auth, chat
from app.database import Base, engine
from fastapi.middleware.cors import CORSMiddleware
import os

# Load environment variables (if using dotenv)
# from dotenv import load_dotenv
# load_dotenv()

# Initialize database
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Chat-AI Backend",
    description="Backend service for Chat-GPT/Claude-like application",
    version="1.0.0",
)

# CORS settings
origins = [
    "http://localhost:3000",  # React frontend
    # Add your deployed frontend URL here, e.g., "https://your-frontend-domain.com"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,        # Allows specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(chat.router)

# Root endpoint
@app.get("/")
def read_root():
    return {"message": "Welcome to the Chat-AI Backend!"}