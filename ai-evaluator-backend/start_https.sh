#!/bin/bash

# HTTPS Server Startup Script for AI Evaluator Backend
# This script starts the FastAPI server with HTTPS enabled

echo "Starting AI Evaluator Backend with HTTPS..."

# Activate virtual environment
source venv/bin/activate

# Load environment variables
set -a
source .env
set +a

# Ensure HTTPS is enabled
export USE_HTTPS=true

# Start server
python simple_main.py