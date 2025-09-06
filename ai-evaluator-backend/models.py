from beanie import Document as BeanieDocument, Indexed
from pydantic import BaseModel, Field
from typing import Optional, Any, Dict, List
from datetime import datetime
from bson import ObjectId

class PyObjectId(ObjectId):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid objectid")
        return ObjectId(v)

    @classmethod
    def __get_pydantic_json_schema__(cls, core_schema, handler):
        json_schema = handler(core_schema)
        json_schema.update(type="string")
        return json_schema

class Document(BeanieDocument):
    id: Optional[PyObjectId] = Field(default_factory=PyObjectId, alias="_id")
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

class Feedback(BeanieDocument):
    id: Optional[PyObjectId] = Field(default_factory=PyObjectId, alias="_id")
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