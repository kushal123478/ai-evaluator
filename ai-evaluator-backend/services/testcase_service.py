import os
import json
import aiofiles
from datetime import datetime
from typing import List
from pathlib import Path
from schemas import TestCaseResponse, DocumentCreate, DocumentResponse
from services.document_service import document_service
from models import TestCase

class TestCaseService:
    
    def __init__(self):
        self.test_data_path = Path("test-data")
        
    async def scan_test_cases(self) -> List[TestCaseResponse]:
        """Get all test cases from MongoDB"""
        test_cases = []
        
        # Fetch all test cases from MongoDB
        mongodb_test_cases = await TestCase.find_all().to_list()
        
        for test_case in mongodb_test_cases:
            response = TestCaseResponse(
                id=test_case.filename,
                filename=test_case.filename,
                originalName=test_case.original_name,
                jsonFile=test_case.json_file,
                pdfFile=test_case.pdf_file,
                aiOutput=test_case.ai_output,
                lastModified=test_case.last_modified
            )
            test_cases.append(response)
        
        # Sort by last modified (newest first)
        test_cases.sort(key=lambda x: x.last_modified, reverse=True)
        return test_cases
    
    async def load_test_case(self, test_case_id: str) -> DocumentResponse:
        """Load a test case from MongoDB into the database for evaluation"""
        # Find test case in MongoDB
        test_case = await TestCase.find_one(TestCase.filename == test_case_id)
        
        if not test_case:
            raise FileNotFoundError("Test case not found")
        
        # Determine PDF path
        if test_case.pdf_file:
            file_path = f"/test-data/{test_case.pdf_file}"
        else:
            file_path = "/test-data/placeholder.pdf"
        
        # Check if document already exists
        documents = await document_service.get_all_documents()
        existing_doc = next((doc for doc in documents if doc.filename == test_case_id), None)
        
        if existing_doc:
            # Update existing document - get the raw document and update it
            from models import Document
            
            document = await Document.get(existing_doc.id)
            document.ai_output = test_case.ai_output
            document.file_path = file_path
            await document.save()
            
            return await document_service.get_document(existing_doc.id)
        else:
            # Create new document
            doc_create = DocumentCreate(
                filename=test_case_id,
                original_name=test_case.original_name,
                file_path=file_path,
                ai_output=test_case.ai_output
            )
            
            return await document_service.create_document(doc_create)
    
    async def migrate_json_files_to_mongodb(self) -> int:
        """Migrate existing JSON files from test-data directory to MongoDB"""
        if not self.test_data_path.exists():
            return 0
            
        migrated_count = 0
        
        # Find all JSON files
        json_files = list(self.test_data_path.glob("*.json"))
        
        for json_file in json_files:
            if json_file.name == "README.md":
                continue
                
            base_name = json_file.stem
            pdf_file = self.test_data_path / f"{base_name}.pdf"
            
            try:
                # Check if already exists in MongoDB
                existing = await TestCase.find_one(TestCase.filename == base_name)
                if existing:
                    print(f"Test case {base_name} already exists in MongoDB, skipping...")
                    continue
                
                # Read JSON content
                async with aiofiles.open(json_file, 'r') as f:
                    content = await f.read()
                    ai_output = json.loads(content)
                
                # Check if PDF exists
                has_pdf = pdf_file.exists()
                
                # Get file modification time
                stat = json_file.stat()
                last_modified = datetime.fromtimestamp(stat.st_mtime)
                
                # Create TestCase document
                test_case = TestCase(
                    filename=base_name,
                    original_name=f"{base_name}.pdf",
                    json_file=json_file.name,
                    pdf_file=f"{base_name}.pdf" if has_pdf else None,
                    ai_output=ai_output,
                    last_modified=last_modified
                )
                
                # Save to MongoDB
                await test_case.save()
                migrated_count += 1
                print(f"Migrated {base_name} to MongoDB")
                
            except Exception as e:
                print(f"Error migrating {json_file}: {e}")
                continue
        
        return migrated_count

testcase_service = TestCaseService()