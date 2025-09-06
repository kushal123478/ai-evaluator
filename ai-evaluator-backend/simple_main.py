from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import json
import os
import uuid
from datetime import datetime
from pathlib import Path
import aiofiles
from auth import get_current_user, get_optional_user

app = FastAPI(title="AI Output Evaluator API", version="1.0.0")

# CORS middleware - Environment-based configuration
import os

environment = os.getenv("ENVIRONMENT", "development")
if environment == "production":
    # Production CORS - Azure Container Instances domains
    allowed_origins = [
        "https://ai-evaluator-frontend.eastus.azurecontainer.io",   # Frontend ACI domain (HTTPS)
        "http://ai-evaluator-frontend.eastus.azurecontainer.io",    # Frontend ACI domain (HTTP)
        "https://localhost:3000",   # Local development HTTPS
        "http://localhost:3000",    # Local development HTTP
        "https://127.0.0.1:3000",   # Local development HTTPS
        "http://127.0.0.1:3000",    # Local development HTTP
        "https://localhost:80",     # Local nginx HTTPS
        "http://localhost:80",      # Local nginx HTTP
        "https://127.0.0.1:80",     # Local nginx HTTPS
        "http://127.0.0.1:80",      # Local nginx HTTP
    ]
else:
    # Development CORS - HTTP and HTTPS
    allowed_origins = [
        "https://localhost:3000",   # Frontend dev server HTTPS
        "http://localhost:3000",    # Frontend dev server HTTP
        "https://127.0.0.1:3000",   # Frontend dev server HTTPS
        "http://127.0.0.1:3000",    # Frontend dev server HTTP
        "https://localhost:3001",   # Alternative port HTTPS
        "http://localhost:3001",    # Alternative port HTTP
        "https://127.0.0.1:3001",   # Alternative port HTTPS
        "http://127.0.0.1:3001",    # Alternative port HTTP
        "https://localhost:80",     # nginx HTTPS
        "http://localhost:80",      # nginx HTTP
        "https://127.0.0.1:80",     # nginx HTTPS
        "http://127.0.0.1:80",      # nginx HTTP
    ]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_origin_regex=r"https?://.*\.azurecontainer\.io",  # Allow HTTP/HTTPS Azure domains
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files
app.mount("/test-data", StaticFiles(directory="test-data"), name="test-data")
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# Create data directory
os.makedirs("data", exist_ok=True)
DOCUMENTS_FILE = "data/documents.json"
FEEDBACKS_FILE = "data/feedbacks.json"

# Pydantic models
class DocumentCreate(BaseModel):
    filename: str
    original_name: str
    file_path: str
    ai_output: Dict[str, Any]

class DocumentResponse(BaseModel):
    id: str
    filename: str
    originalName: str = Field(alias="original_name")
    filePath: str = Field(alias="file_path")
    uploadedAt: str = Field(alias="uploaded_at")
    aiOutput: Dict[str, Any] = Field(alias="ai_output")
    isSubmitted: bool = Field(alias="is_submitted")
    submittedAt: Optional[str] = Field(alias="submitted_at", default=None)
    feedbacks: List[Dict] = []

    class Config:
        populate_by_name = True

class FeedbackCreate(BaseModel):
    documentId: str
    fieldPath: str
    fieldName: str
    aiValue: str
    isCorrect: bool
    correctValue: Optional[str] = None
    confidence: Optional[int] = None
    comment: Optional[str] = None

class TestCaseResponse(BaseModel):
    id: str
    filename: str
    originalName: str
    jsonFile: str
    pdfFile: Optional[str] = None
    aiOutput: Dict[str, Any]
    lastModified: str

# Helper functions
async def load_json_file(filename: str) -> List[Dict]:
    if not os.path.exists(filename):
        return []
    try:
        async with aiofiles.open(filename, 'r') as f:
            content = await f.read()
            return json.loads(content) if content.strip() else []
    except:
        return []

async def save_json_file(filename: str, data: List[Dict]):
    async with aiofiles.open(filename, 'w') as f:
        await f.write(json.dumps(data, indent=2, default=str))

def convert_feedback_to_camelcase(feedback: Dict) -> Dict:
    """Convert feedback from snake_case to camelCase"""
    return {
        "id": feedback["id"],
        "documentId": feedback["document_id"],
        "fieldPath": feedback["field_path"],
        "fieldName": feedback["field_name"],
        "aiValue": feedback["ai_value"],
        "isCorrect": feedback["is_correct"],
        "correctValue": feedback["correct_value"],
        "confidence": feedback["confidence"],
        "comment": feedback["comment"],
        "createdAt": feedback["created_at"]
    }

def convert_document_to_camelcase(doc: Dict, feedbacks: List[Dict] = None) -> Dict:
    """Convert document from snake_case to camelCase"""
    return {
        "id": doc["id"],
        "filename": doc["filename"],
        "originalName": doc["original_name"],
        "filePath": doc["file_path"],
        "uploadedAt": doc["uploaded_at"],
        "aiOutput": doc["ai_output"],
        "isSubmitted": doc["is_submitted"],
        "submittedAt": doc["submitted_at"],
        "feedbacks": [convert_feedback_to_camelcase(f) for f in (feedbacks or [])]
    }

@app.get("/")
async def root():
    return {"message": "AI Output Evaluator FastAPI Server"}

@app.get("/api/health")
async def health_check():
    return {"status": "ok", "timestamp": datetime.now().isoformat()}

# Authentication Routes
@app.get("/api/auth/me")
async def get_user_info():
    """Get current user information"""
    return {
        "sub": "dev-user",
        "name": "Development User",
        "email": "dev@example.com",
        "roles": []
    }

# Test Cases Routes
@app.get("/api/testcases/scan")
async def scan_test_cases():
    test_data_path = Path("test-data")
    if not test_data_path.exists():
        return []
    
    test_cases = []
    json_files = list(test_data_path.glob("*.json"))
    
    for json_file in json_files:
        if json_file.name == "README.md":
            continue
            
        base_name = json_file.stem
        pdf_file = test_data_path / f"{base_name}.pdf"
        
        try:
            async with aiofiles.open(json_file, 'r') as f:
                content = await f.read()
                ai_output = json.loads(content)
            
            has_pdf = pdf_file.exists()
            stat = json_file.stat()
            last_modified = datetime.fromtimestamp(stat.st_mtime)
            
            test_case = TestCaseResponse(
                id=base_name,
                filename=base_name,
                originalName=f"{base_name}.pdf",
                jsonFile=json_file.name,
                pdfFile=f"{base_name}.pdf" if has_pdf else None,
                aiOutput=ai_output,
                lastModified=last_modified.isoformat()
            )
            test_cases.append(test_case.dict())
            
        except Exception as e:
            print(f"Error processing {json_file}: {e}")
            continue
    
    test_cases.sort(key=lambda x: x['lastModified'], reverse=True)
    return test_cases

@app.post("/api/testcases/load/{test_case_id}")
async def load_test_case(test_case_id: str):
    json_file = Path(f"test-data/{test_case_id}.json")
    pdf_file = Path(f"test-data/{test_case_id}.pdf")
    
    if not json_file.exists():
        raise HTTPException(status_code=404, detail="Test case not found")
    
    async with aiofiles.open(json_file, 'r') as f:
        content = await f.read()
        ai_output = json.loads(content)
    
    file_path = f"/test-data/{test_case_id}.pdf" if pdf_file.exists() else "/test-data/placeholder.pdf"
    
    documents = await load_json_file(DOCUMENTS_FILE)
    existing_doc = next((doc for doc in documents if doc["filename"] == test_case_id), None)
    
    if existing_doc:
        existing_doc["ai_output"] = ai_output
        existing_doc["file_path"] = file_path
        await save_json_file(DOCUMENTS_FILE, documents)
        
        feedbacks = await load_json_file(FEEDBACKS_FILE)
        doc_feedbacks = [f for f in feedbacks if f["document_id"] == existing_doc["id"]]
        
        # Convert to camelCase for frontend compatibility
        return {
            "id": existing_doc["id"],
            "filename": existing_doc["filename"],
            "originalName": existing_doc["original_name"],
            "filePath": existing_doc["file_path"],
            "uploadedAt": existing_doc["uploaded_at"],
            "aiOutput": existing_doc["ai_output"],
            "isSubmitted": existing_doc["is_submitted"],
            "submittedAt": existing_doc["submitted_at"],
            "feedbacks": [convert_feedback_to_camelcase(f) for f in doc_feedbacks]
        }
    else:
        new_doc = {
            "id": str(uuid.uuid4()),
            "filename": test_case_id,
            "original_name": f"{test_case_id}.pdf",
            "file_path": file_path,
            "uploaded_at": datetime.now().isoformat(),
            "ai_output": ai_output,
            "is_submitted": False,
            "submitted_at": None,
            "feedbacks": []
        }
        documents.append(new_doc)
        await save_json_file(DOCUMENTS_FILE, documents)
        
        # Convert to camelCase for frontend compatibility
        return convert_document_to_camelcase(new_doc, [])

# Document Routes
@app.get("/api/documents")
async def get_documents():
    documents = await load_json_file(DOCUMENTS_FILE)
    feedbacks = await load_json_file(FEEDBACKS_FILE)
    
    result = []
    for doc in documents:
        doc_feedbacks = [f for f in feedbacks if f["document_id"] == doc["id"]]
        result.append(convert_document_to_camelcase(doc, doc_feedbacks))
    
    return result

@app.get("/api/documents/{document_id}")
async def get_document(document_id: str):
    documents = await load_json_file(DOCUMENTS_FILE)
    document = next((doc for doc in documents if doc["id"] == document_id), None)
    
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    
    feedbacks = await load_json_file(FEEDBACKS_FILE)
    doc_feedbacks = [f for f in feedbacks if f["document_id"] == document_id]
    
    return convert_document_to_camelcase(document, doc_feedbacks)

@app.post("/api/documents/{document_id}/submit")
async def submit_document(document_id: str):
    documents = await load_json_file(DOCUMENTS_FILE)
    document = next((doc for doc in documents if doc["id"] == document_id), None)
    
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    
    if document["is_submitted"]:
        raise HTTPException(status_code=400, detail="Document already submitted")
    
    document["is_submitted"] = True
    document["submitted_at"] = datetime.now().isoformat()
    
    await save_json_file(DOCUMENTS_FILE, documents)
    
    feedbacks = await load_json_file(FEEDBACKS_FILE)
    doc_feedbacks = [f for f in feedbacks if f["document_id"] == document_id]
    
    return convert_document_to_camelcase(document, doc_feedbacks)

@app.delete("/api/documents/{document_id}")
async def delete_document(document_id: str):
    documents = await load_json_file(DOCUMENTS_FILE)
    document = next((doc for doc in documents if doc["id"] == document_id), None)
    
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    
    # Remove document
    documents = [doc for doc in documents if doc["id"] != document_id]
    await save_json_file(DOCUMENTS_FILE, documents)
    
    # Remove associated feedbacks
    feedbacks = await load_json_file(FEEDBACKS_FILE)
    feedbacks = [f for f in feedbacks if f["document_id"] != document_id]
    await save_json_file(FEEDBACKS_FILE, feedbacks)
    
    return {"success": True}

# Feedback Routes
@app.post("/api/feedback")
async def create_feedback(feedback: FeedbackCreate):
    feedbacks = await load_json_file(FEEDBACKS_FILE)
    
    # Check if feedback exists
    existing = next((f for f in feedbacks if f["document_id"] == feedback.documentId and f["field_path"] == feedback.fieldPath), None)
    
    feedback_data = {
        "id": existing["id"] if existing else str(uuid.uuid4()),
        "document_id": feedback.documentId,
        "field_path": feedback.fieldPath,
        "field_name": feedback.fieldName,
        "ai_value": feedback.aiValue,
        "is_correct": feedback.isCorrect,
        "correct_value": feedback.correctValue,
        "confidence": feedback.confidence,
        "comment": feedback.comment,
        "created_at": datetime.now().isoformat()
    }
    
    if existing:
        # Update existing
        for i, f in enumerate(feedbacks):
            if f["id"] == existing["id"]:
                feedbacks[i] = feedback_data
                break
    else:
        # Add new
        feedbacks.append(feedback_data)
    
    await save_json_file(FEEDBACKS_FILE, feedbacks)
    return convert_feedback_to_camelcase(feedback_data)

# Dashboard Routes
@app.get("/api/dashboard/stats")
async def get_dashboard_stats():
    documents = await load_json_file(DOCUMENTS_FILE)
    feedbacks = await load_json_file(FEEDBACKS_FILE)
    
    total_documents = len(documents)
    total_feedbacks = len(feedbacks)
    
    if total_feedbacks > 0:
        correct_feedbacks = [f for f in feedbacks if f["is_correct"]]
        accuracy = (len(correct_feedbacks) / total_feedbacks) * 100
    else:
        accuracy = 0
    
    evaluated_documents = len(set(f["document_id"] for f in feedbacks))
    
    confidence_scores = [f["confidence"] for f in feedbacks if f.get("confidence")]
    avg_confidence = sum(confidence_scores) / len(confidence_scores) if confidence_scores else 0
    
    document_types = {}
    for doc in documents:
        doc_type = doc["ai_output"].get("documentType", "unknown")
        document_types[doc_type] = document_types.get(doc_type, 0) + 1
    
    submitted_documents = len([d for d in documents if d["is_submitted"]])
    
    return {
        "totalDocuments": total_documents,
        "evaluatedDocuments": evaluated_documents,
        "totalFeedbacks": total_feedbacks,
        "accuracyRate": round(accuracy, 2),
        "averageConfidence": round(avg_confidence, 2),
        "documentTypes": document_types,
        "recentActivity": total_feedbacks,  # Simplified
        "submittedDocuments": submitted_documents
    }

if __name__ == "__main__":
    import uvicorn
    import os
    from pathlib import Path
    
    # Use environment variable for port, default to 8000
    port = int(os.getenv("PORT", 8000))
    host = os.getenv("HOST", "0.0.0.0")
    
    # HTTPS configuration
    use_https = os.getenv("USE_HTTPS", "false").lower() == "true"
    
    if use_https:
        ssl_certfile = os.getenv("SSL_CERTFILE", "ssl_cert.pem")
        ssl_keyfile = os.getenv("SSL_KEYFILE", "ssl_key.pem")
        
        print(f"Starting HTTPS server on port {port}")
        uvicorn.run(
            "simple_main:app",
            host=host,
            port=port,
            ssl_certfile=ssl_certfile,
            ssl_keyfile=ssl_keyfile,
            reload=True
        )
    else:
        print(f"Starting HTTP server on port {port}")
        uvicorn.run("simple_main:app", host=host, port=port, reload=True)