from pydantic import BaseModel, Field
from typing import Optional, Any, Dict, List
from datetime import datetime

class DocumentCreate(BaseModel):
    filename: str
    original_name: str
    file_path: str
    ai_output: Dict[str, Any]

class DocumentResponse(BaseModel):
    id: str
    filename: str
    original_name: str = Field(alias="originalName")
    file_path: str = Field(alias="filePath")
    uploaded_at: datetime = Field(alias="uploadedAt")
    ai_output: Dict[str, Any] = Field(alias="aiOutput")
    is_submitted: bool = Field(alias="isSubmitted")
    submitted_at: Optional[datetime] = Field(alias="submittedAt", default=None)
    feedbacks: Optional[List["FeedbackResponse"]] = []

    class Config:
        populate_by_name = True

class FeedbackCreate(BaseModel):
    document_id: str = Field(alias="documentId")
    field_path: str = Field(alias="fieldPath")
    field_name: str = Field(alias="fieldName")
    ai_value: str = Field(alias="aiValue")
    is_correct: bool = Field(alias="isCorrect")
    correct_value: Optional[str] = Field(alias="correctValue", default=None)
    confidence: Optional[int] = None
    comment: Optional[str] = None

    class Config:
        populate_by_name = True

class FeedbackResponse(BaseModel):
    id: str
    document_id: str = Field(alias="documentId")
    field_path: str = Field(alias="fieldPath")
    field_name: str = Field(alias="fieldName")
    ai_value: str = Field(alias="aiValue")
    is_correct: bool = Field(alias="isCorrect")
    correct_value: Optional[str] = Field(alias="correctValue", default=None)
    confidence: Optional[int] = None
    comment: Optional[str] = None
    created_at: datetime = Field(alias="createdAt")

    class Config:
        populate_by_name = True

class TestCaseResponse(BaseModel):
    id: str
    filename: str
    original_name: str = Field(alias="originalName")
    json_file: str = Field(alias="jsonFile")
    pdf_file: Optional[str] = Field(alias="pdfFile", default=None)
    ai_output: Dict[str, Any] = Field(alias="aiOutput")
    last_modified: datetime = Field(alias="lastModified")

    class Config:
        populate_by_name = True

# Update forward references
DocumentResponse.model_rebuild()