# Use Python 3.12 slim image
FROM python:3.12-slim

# Set working directory
WORKDIR /app

# Install system dependencies including OpenSSL for certificate generation
RUN apt-get update && apt-get install -y \
    gcc \
    openssl \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first to leverage Docker cache
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create necessary directories
RUN mkdir -p data uploads

# Generate SSL certificates if they don't exist (for standalone container)
RUN if [ ! -f ssl_cert.pem ]; then \
    openssl req -x509 -newkey rsa:4096 -keyout ssl_key.pem -out ssl_cert.pem -days 365 -nodes \
    -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost"; \
    fi

# Expose ports
EXPOSE 8000

# Command to run the application
CMD ["python", "simple_main.py"]