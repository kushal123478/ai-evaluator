from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from typing import List
import os
from pathlib import Path

from database import connect_to_mongo, close_mongo_connection
from schemas import DocumentResponse, FeedbackCreate, FeedbackResponse
from services.testcase_service import testcase_service
from services.document_service import document_service
from services.feedback_service import feedback_service
from services.dashboard_service import dashboard_service

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
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001", 
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
    uvicorn.run(app, host="0.0.0.0", port=5000)