from typing import List, Optional
from datetime import datetime
from models import Document, Feedback
from schemas import DocumentCreate, DocumentResponse
from bson import ObjectId

class DocumentService:
    
    async def get_all_documents(self) -> List[DocumentResponse]:
        """Get all documents with feedback counts"""
        documents = await Document.find_all().to_list()
        result = []
        
        for doc in documents:
            feedbacks = await Feedback.find(Feedback.document_id == str(doc.id)).to_list()
            doc_dict = doc.dict()
            doc_dict["id"] = str(doc.id)
            doc_dict["feedbacks"] = [
                {
                    "id": str(f.id),
                    "documentId": f.document_id,
                    "fieldPath": f.field_path,
                    "fieldName": f.field_name,
                    "aiValue": f.ai_value,
                    "isCorrect": f.is_correct,
                    "correctValue": f.correct_value,
                    "confidence": f.confidence,
                    "comment": f.comment,
                    "createdAt": f.created_at
                } for f in feedbacks
            ]
            result.append(DocumentResponse(**doc_dict))
        
        return result

    async def get_document(self, document_id: str) -> Optional[DocumentResponse]:
        """Get a single document by ID with feedbacks"""
        try:
            document = await Document.get(ObjectId(document_id))
            if not document:
                return None
                
            feedbacks = await Feedback.find(Feedback.document_id == document_id).to_list()
            
            doc_dict = document.dict()
            doc_dict["id"] = str(document.id)
            doc_dict["feedbacks"] = [
                {
                    "id": str(f.id),
                    "documentId": f.document_id,
                    "fieldPath": f.field_path,
                    "fieldName": f.field_name,
                    "aiValue": f.ai_value,
                    "isCorrect": f.is_correct,
                    "correctValue": f.correct_value,
                    "confidence": f.confidence,
                    "comment": f.comment,
                    "createdAt": f.created_at
                } for f in feedbacks
            ]
            
            return DocumentResponse(**doc_dict)
        except:
            return None

    async def create_document(self, doc_data: DocumentCreate) -> DocumentResponse:
        """Create a new document"""
        document = Document(**doc_data.dict())
        await document.insert()
        
        doc_dict = document.dict()
        doc_dict["id"] = str(document.id)
        doc_dict["feedbacks"] = []
        
        return DocumentResponse(**doc_dict)

    async def submit_document(self, document_id: str) -> Optional[DocumentResponse]:
        """Submit and lock a document"""
        try:
            document = await Document.get(ObjectId(document_id))
            if not document:
                return None
                
            if document.is_submitted:
                return None  # Already submitted
                
            document.is_submitted = True
            document.submitted_at = datetime.utcnow()
            await document.save()
            
            return await self.get_document(document_id)
        except:
            return None

    async def delete_document(self, document_id: str) -> bool:
        """Delete a document and its feedbacks"""
        try:
            # Delete associated feedbacks
            await Feedback.find(Feedback.document_id == document_id).delete()
            
            # Delete document
            document = await Document.get(ObjectId(document_id))
            if document:
                await document.delete()
                return True
            return False
        except:
            return False

document_service = DocumentService()