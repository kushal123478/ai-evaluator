from beanie import Document as BeanieDocument, Indexed, PydanticObjectId
from pydantic import BaseModel, Field
from typing import Optional, Any, Dict, List
from datetime import datetime
from bson import ObjectId

class Document(BeanieDocument):
    id: Optional[PydanticObjectId] = Field(default=None, alias="_id")
    filename: str
    original_name: str
    file_path: str
    uploaded_at: datetime = Field(default_factory=datetime.utcnow)
    ai_output: Dict[str, Any]
    is_submitted: bool = False
    submitted_at: Optional[datetime] = None

    class Settings:
        collection = "documents"
        
    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

class TestCase(BeanieDocument):
    id: Optional[PydanticObjectId] = Field(default=None, alias="_id")
    filename: str  # e.g., "invoice_001"
    original_name: str  # e.g., "invoice_001.pdf"
    json_file: str  # e.g., "invoice_001.json"
    pdf_file: Optional[str] = None  # e.g., "invoice_001.pdf"
    ai_output: Dict[str, Any]  # The JSON content
    created_at: datetime = Field(default_factory=datetime.utcnow)
    last_modified: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        collection = "testcases"
        
    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

class Feedback(BeanieDocument):
    id: Optional[PydanticObjectId] = Field(default=None, alias="_id")
    document_id: str
    field_path: str
    field_name: str
    ai_value: str
    is_correct: bool
    correct_value: Optional[str] = None
    confidence: Optional[int] = None
    comment: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        collection = "feedbacks"
        
    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}