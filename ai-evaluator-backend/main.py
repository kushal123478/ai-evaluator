from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from typing import List, Dict, Any
import os
from pathlib import Path
from datetime import datetime

from database import connect_to_mongo, close_mongo_connection
from schemas import DocumentResponse, FeedbackCreate, FeedbackResponse
from services.testcase_service import testcase_service
from services.document_service import document_service
from services.feedback_service import feedback_service
from services.dashboard_service import dashboard_service
from auth import get_current_user, get_optional_user


app = FastAPI(title="AI Output Evaluator API", version="1.0.0")

@app.on_event("startup")
async def startup_event():
    await connect_to_mongo()
    
    # Create directories if they don't exist
    Path("test-data").mkdir(exist_ok=True)
    Path("uploads").mkdir(exist_ok=True)

@app.on_event("shutdown")
async def shutdown_event():
    await close_mongo_connection()

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://localhost:3000",
        "http://localhost:3000",
        "https://127.0.0.1:3000",
        "http://127.0.0.1:3000",
        "https://localhost:3001", 
        "http://localhost:3001",
        "https://127.0.0.1:3001",
        "http://127.0.0.1:3001"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files
app.mount("/test-data", StaticFiles(directory="test-data"), name="test-data")
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

@app.get("/")
async def root():
    return {"message": "AI Output Evaluator API"}

@app.get("/api/health")
async def health_check():
    return {"status": "ok", "timestamp": datetime.now().isoformat()}

# Authentication Routes
@app.get("/api/auth/me")
async def get_user_info():
    """Get current user information"""
    return {
        "user": current_user,
        "authenticated": True
    }

@app.get("/api/auth/config")
async def get_auth_config():
    """Get authentication configuration for frontend"""
    return {
        "tenantId": os.getenv("AZURE_TENANT_ID"),
        "clientId": os.getenv("AZURE_CLIENT_ID"),
        "authority": f"https://login.microsoftonline.com/{os.getenv('AZURE_TENANT_ID')}"
    }

# Test Cases Routes
@app.get("/api/testcases/scan")
async def scan_test_cases():
    return await testcase_service.scan_test_cases()

@app.post("/api/testcases/load/{test_case_id}")
async def load_test_case(test_case_id: str):
    try:
        return await testcase_service.load_test_case(test_case_id)
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Test case not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/testcases/migrate")
async def migrate_test_cases():
    """Migrate existing JSON files from test-data directory to MongoDB"""
    try:
        count = await testcase_service.migrate_json_files_to_mongodb()
        return {"migrated_count": count, "message": f"Successfully migrated {count} test cases to MongoDB"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Document Routes
@app.get("/api/documents", response_model=List[DocumentResponse])
async def get_documents():
    return await document_service.get_all_documents()

@app.get("/api/documents/{document_id}", response_model=DocumentResponse)
async def get_document(document_id: str):
    document = await document_service.get_document(document_id)
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    return document

@app.post("/api/documents/{document_id}/submit")
async def submit_document(document_id: str):
    document = await document_service.submit_document(document_id)
    if not document:
        raise HTTPException(status_code=404, detail="Document not found or already submitted")
    return document

@app.delete("/api/documents/{document_id}")
async def delete_document(document_id: str):
    success = await document_service.delete_document(document_id)
    if not success:
        raise HTTPException(status_code=404, detail="Document not found")
    return {"success": True}

# Feedback Routes
@app.post("/api/feedback", response_model=FeedbackResponse)
async def create_feedback(feedback: FeedbackCreate):
    return await feedback_service.create_or_update_feedback(feedback)

# Dashboard Routes
@app.get("/api/dashboard/stats")
async def get_dashboard_stats():
    return await dashboard_service.get_dashboard_stats()

if __name__ == "__main__":
    import uvicorn
    import os
    
    # Use environment variables for configuration
    port = int(os.getenv("PORT", 8000))
    host = os.getenv("HOST", "0.0.0.0")
    
    # HTTPS configuration
    use_https = os.getenv("USE_HTTPS", "false").lower() == "true"
    
    if use_https:
        ssl_certfile = os.getenv("SSL_CERTFILE", "ssl_cert.pem")
        ssl_keyfile = os.getenv("SSL_KEYFILE", "ssl_key.pem")
        
        print(f"Starting HTTPS server on port {port}")
        uvicorn.run(
            app,
            host=host,
            port=port,
            ssl_certfile=ssl_certfile,
            ssl_keyfile=ssl_keyfile,
            reload=False  # Disable reload for HTTPS
        )
    else:
        print(f"Starting HTTP server on port {port}")
        uvicorn.run(app, host=host, port=port)