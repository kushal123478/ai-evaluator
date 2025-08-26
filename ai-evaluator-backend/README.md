# AI Evaluator Backend

A FastAPI-based backend service for the AI Output Evaluator application, providing APIs for document processing, feedback collection, and dashboard analytics.

## Features

- **Document Management**: Upload and process PDF documents
- **AI Output Validation**: Compare AI-extracted data with ground truth
- **Feedback Collection**: Collect and store validation feedback
- **Dashboard Analytics**: Performance metrics and accuracy tracking
- **RESTful API**: Well-documented API endpoints

## Tech Stack

- **Framework**: FastAPI
- **Database**: JSON-based storage (MongoDB-ready)
- **Validation**: Pydantic
- **Authentication**: Ready for integration
- **Deployment**: Docker + Azure Container Apps

## Quick Start

### Local Development

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ai-evaluator-backend
   ```

2. **Set up virtual environment**
   ```bash
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Run the application**
   ```bash
   python simple_main.py
   ```

The API will be available at `http://localhost:5000`

### Docker Deployment

1. **Build Docker image**
   ```bash
   docker build -t ai-evaluator-backend .
   ```

2. **Run container**
   ```bash
   docker run -p 8000:8000 -v $(pwd)/data:/app/data ai-evaluator-backend
   ```

## API Documentation

Once running, visit:
- **Swagger UI**: `http://localhost:5000/docs`
- **ReDoc**: `http://localhost:5000/redoc`

## Project Structure

```
├── simple_main.py          # Application entry point
├── models.py              # Database models
├── schemas.py             # Pydantic schemas
├── services/              # Business logic
│   ├── document_service.py
│   ├── feedback_service.py
│   ├── dashboard_service.py
│   └── testcase_service.py
├── data/                  # JSON data storage
├── uploads/               # File uploads
├── test-data/            # Sample test data
└── requirements.txt       # Python dependencies
```

## Environment Variables

```bash
# Optional - defaults to development
ENVIRONMENT=production

# Database URL (when using MongoDB)
DATABASE_URL=mongodb://localhost:27017/ai_evaluator
```

## Azure Deployment

This project is configured for deployment to Azure Container Apps with GitHub Actions.

### Prerequisites

1. Azure Container Registry
2. Azure Container Apps Environment
3. GitHub Secrets configured:
   - `AZURE_CREDENTIALS`
   - `AZURE_CR_USERNAME`
   - `AZURE_CR_PASSWORD`

### Deployment Process

1. Push to `main` branch triggers automatic deployment
2. Docker image built and pushed to Azure Container Registry
3. Container Apps updated with new image

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

[Add your license here]