import os
import json
import aiofiles
from datetime import datetime
from typing import List
from pathlib import Path
from schemas import TestCaseResponse, DocumentCreate, DocumentResponse
from services.document_service import document_service

class TestCaseService:
    
    def __init__(self):
        self.test_data_path = Path("test-data")
        
    async def scan_test_cases(self) -> List[TestCaseResponse]:
        """Scan test-data directory for JSON and PDF files"""
        if not self.test_data_path.exists():
            return []
            
        test_cases = []
        
        # Find all JSON files
        json_files = list(self.test_data_path.glob("*.json"))
        
        for json_file in json_files:
            if json_file.name == "README.md":
                continue
                
            base_name = json_file.stem
            pdf_file = self.test_data_path / f"{base_name}.pdf"
            
            try:
                # Read JSON content
                async with aiofiles.open(json_file, 'r') as f:
                    content = await f.read()
                    ai_output = json.loads(content)
                
                # Check if PDF exists
                has_pdf = pdf_file.exists()
                
                # Get file modification time
                stat = json_file.stat()
                last_modified = datetime.fromtimestamp(stat.st_mtime)
                
                test_case = TestCaseResponse(
                    id=base_name,
                    filename=base_name,
                    originalName=f"{base_name}.pdf",
                    jsonFile=json_file.name,
                    pdfFile=f"{base_name}.pdf" if has_pdf else None,
                    aiOutput=ai_output,
                    lastModified=last_modified
                )
                test_cases.append(test_case)
                
            except Exception as e:
                print(f"Error processing {json_file}: {e}")
                continue
        
        # Sort by last modified (newest first)
        test_cases.sort(key=lambda x: x.last_modified, reverse=True)
        return test_cases
    
    async def load_test_case(self, test_case_id: str) -> DocumentResponse:
        """Load a test case into the database for evaluation"""
        json_file = self.test_data_path / f"{test_case_id}.json"
        pdf_file = self.test_data_path / f"{test_case_id}.pdf"
        
        if not json_file.exists():
            raise FileNotFoundError("Test case not found")
        
        # Read JSON content
        async with aiofiles.open(json_file, 'r') as f:
            content = await f.read()
            ai_output = json.loads(content)
        
        # Determine PDF path
        if pdf_file.exists():
            file_path = f"/test-data/{test_case_id}.pdf"
        else:
            file_path = "/test-data/placeholder.pdf"
        
        # Check if document already exists
        documents = await document_service.get_all_documents()
        existing_doc = next((doc for doc in documents if doc.filename == test_case_id), None)
        
        if existing_doc:
            # Update existing document - get the raw document and update it
            from models import Document
            from bson import ObjectId
            
            document = await Document.get(ObjectId(existing_doc.id))
            document.ai_output = ai_output
            document.file_path = file_path
            await document.save()
            
            return await document_service.get_document(existing_doc.id)
        else:
            # Create new document
            doc_create = DocumentCreate(
                filename=test_case_id,
                original_name=f"{test_case_id}.pdf",
                file_path=file_path,
                ai_output=ai_output
            )
            
            return await document_service.create_document(doc_create)

testcase_service = TestCaseService()