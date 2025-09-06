# AI Evaluator Architecture

This document provides an overview of the AI Evaluator system architecture.

## System Architecture Diagram

```mermaid
graph TB
    %% External Users
    User[👤 User/Evaluator]
    
    %% Frontend Layer
    subgraph "Frontend Layer"
        WebApp[🌐 React Web Application<br/>TypeScript + Vite]
        Components[📦 UI Components<br/>- Dashboard<br/>- Document Viewer<br/>- Feedback Forms]
    end
    
    %% Reverse Proxy
    Nginx[🔀 Nginx Reverse Proxy<br/>Port 80]
    
    %% Backend Layer
    subgraph "Backend Layer"
        API[🚀 FastAPI Server<br/>Python + Uvicorn<br/>Port 8000]
        
        subgraph "Services"
            TestcaseService[📋 Testcase Service<br/>- Scan test cases<br/>- Load test data]
            DocumentService[📄 Document Service<br/>- CRUD operations<br/>- Submission handling]
            FeedbackService[💬 Feedback Service<br/>- Create/Update feedback<br/>- Validation]
            DashboardService[📊 Dashboard Service<br/>- Statistics<br/>- Analytics]
        end
        
        subgraph "Data Models"
            DocumentModel[📝 Document Model<br/>Beanie ODM]
            FeedbackModel[🗨️ Feedback Model<br/>Beanie ODM]
        end
    end
    
    %% Database Layer
    Database[(🍃 MongoDB<br/>AI Evaluator DB)]
    
    %% File System
    subgraph "File System"
        TestData[📁 Test Data<br/>PDF files, samples]
        Uploads[📁 Uploads<br/>User uploaded files]
        StaticFiles[📁 Static Files<br/>Served by FastAPI]
    end
    
    %% External Services (if any)
    subgraph "External Services"
        AIModels[🤖 AI Models/APIs<br/>For evaluation tasks]
    end
    
    %% Connections
    User --> WebApp
    WebApp --> Nginx
    Nginx --> API
    
    API --> TestcaseService
    API --> DocumentService
    API --> FeedbackService
    API --> DashboardService
    
    DocumentService --> DocumentModel
    FeedbackService --> FeedbackModel
    
    DocumentModel --> Database
    FeedbackModel --> Database
    
    API --> TestData
    API --> Uploads
    API --> StaticFiles
    
    %% Optional AI service connections
    TestcaseService -.-> AIModels
    DocumentService -.-> AIModels
    
    %% Styling
    classDef frontend fill:#e1f5fe,stroke:#0277bd,stroke-width:2px
    classDef backend fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px
    classDef database fill:#e8f5e8,stroke:#388e3c,stroke-width:2px
    classDef storage fill:#fff3e0,stroke:#f57c00,stroke-width:2px
    classDef external fill:#fce4ec,stroke:#c2185b,stroke-width:2px
    
    class WebApp,Components,Nginx frontend
    class API,TestcaseService,DocumentService,FeedbackService,DashboardService,DocumentModel,FeedbackModel backend
    class Database database
    class TestData,Uploads,StaticFiles storage
    class AIModels external
```

## Component Overview

### Frontend Layer
- **React Web Application**: Modern SPA built with TypeScript, Vite, and Tailwind CSS
- **UI Components**: Reusable components for dashboard, document viewing, and feedback collection
- **Routing**: Client-side routing with React Router for navigation

### Backend Layer
- **FastAPI Server**: High-performance Python API server with automatic OpenAPI documentation
- **Service Architecture**: Modular services handling different business domains:
  - **Testcase Service**: Manages test case scanning and loading
  - **Document Service**: Handles document CRUD operations and submissions
  - **Feedback Service**: Manages user feedback collection and validation
  - **Dashboard Service**: Provides statistics and analytics data

### Database Layer
- **MongoDB**: Document database for storing evaluation data
- **Beanie ODM**: Async Object Document Mapper for Python/MongoDB integration
- **Data Models**: Structured schemas for Documents and Feedback

### File Storage
- **Test Data**: Static test files and sample documents
- **Uploads**: User-uploaded files for evaluation
- **Static File Serving**: Direct file access through FastAPI

### Infrastructure
- **Docker Containerization**: Both frontend and backend are containerized
- **Nginx Reverse Proxy**: Handles HTTP traffic routing and static file serving
- **CORS Support**: Configured for cross-origin requests between frontend and backend

## Data Flow

1. User interacts with the React frontend
2. Frontend makes HTTP requests to the FastAPI backend
3. Backend services process requests and interact with MongoDB
4. File operations access local storage directories
5. Response data flows back through the service layer to the frontend
6. UI updates based on the received data

## Key Features

- **Document Evaluation**: Upload and evaluate AI-generated documents
- **Feedback System**: Collect and manage evaluation feedback
- **Dashboard Analytics**: View statistics and evaluation metrics
- **Test Case Management**: Load and manage test scenarios
- **Real-time Updates**: Async operations for smooth user experience