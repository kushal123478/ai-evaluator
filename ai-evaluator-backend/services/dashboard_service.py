from models import Document, Feedback
from typing import Dict, Any, List

class DashboardService:
    
    async def get_dashboard_stats(self) -> Dict[str, Any]:
        """Get dashboard statistics"""
        
        # Get all documents and feedbacks
        documents = await Document.find_all().to_list()
        feedbacks = await Feedback.find_all().to_list()
        
        total_documents = len(documents)
        total_feedbacks = len(feedbacks)
        
        # Calculate accuracy stats
        if total_feedbacks > 0:
            correct_feedbacks = [f for f in feedbacks if f.is_correct]
            accuracy = (len(correct_feedbacks) / total_feedbacks) * 100
        else:
            accuracy = 0
        
        # Documents with feedbacks
        documents_with_feedback = []
        for doc in documents:
            doc_feedbacks = [f for f in feedbacks if f.document_id == str(doc.id)]
            if doc_feedbacks:
                documents_with_feedback.append(str(doc.id))
        
        evaluated_documents = len(set(documents_with_feedback))
        
        # Confidence distribution
        confidence_scores = [f.confidence for f in feedbacks if f.confidence is not None]
        avg_confidence = sum(confidence_scores) / len(confidence_scores) if confidence_scores else 0
        
        # Document type distribution
        document_types = {}
        for doc in documents:
            doc_type = doc.ai_output.get('documentType', 'unknown')
            document_types[doc_type] = document_types.get(doc_type, 0) + 1
        
        # Recent activity (last 7 days)
        from datetime import datetime, timedelta
        week_ago = datetime.utcnow() - timedelta(days=7)
        recent_feedbacks = [f for f in feedbacks if f.created_at >= week_ago]
        
        return {
            "totalDocuments": total_documents,
            "evaluatedDocuments": evaluated_documents,
            "totalFeedbacks": total_feedbacks,
            "accuracyRate": round(accuracy, 2),
            "averageConfidence": round(avg_confidence, 2),
            "documentTypes": document_types,
            "recentActivity": len(recent_feedbacks),
            "submittedDocuments": len([d for d in documents if d.is_submitted])
        }

dashboard_service = DashboardService()