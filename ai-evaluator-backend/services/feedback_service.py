from models import Feedback
from schemas import FeedbackCreate, FeedbackResponse
from typing import Optional

class FeedbackService:
    
    async def create_or_update_feedback(self, feedback_data: FeedbackCreate) -> FeedbackResponse:
        """Create new feedback or update existing one"""
        
        # Check if feedback already exists for this document and field
        existing_feedback = await Feedback.find_one(
            Feedback.document_id == feedback_data.document_id,
            Feedback.field_path == feedback_data.field_path
        )
        
        if existing_feedback:
            # Update existing feedback
            existing_feedback.field_name = feedback_data.field_name
            existing_feedback.ai_value = feedback_data.ai_value
            existing_feedback.is_correct = feedback_data.is_correct
            existing_feedback.correct_value = feedback_data.correct_value
            existing_feedback.confidence = feedback_data.confidence
            existing_feedback.comment = feedback_data.comment
            
            await existing_feedback.save()
            feedback = existing_feedback
        else:
            # Create new feedback
            feedback = Feedback(**feedback_data.dict())
            await feedback.insert()
        
        return FeedbackResponse(
            id=str(feedback.id),
            documentId=feedback.document_id,
            fieldPath=feedback.field_path,
            fieldName=feedback.field_name,
            aiValue=feedback.ai_value,
            isCorrect=feedback.is_correct,
            correctValue=feedback.correct_value,
            confidence=feedback.confidence,
            comment=feedback.comment,
            createdAt=feedback.created_at
        )

feedback_service = FeedbackService()