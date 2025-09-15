# Use Python 3.10 slim image (more stable)
FROM python:3.10-slim

# Set working directory
WORKDIR /app

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV PYTHONPATH=/app

# Install system dependencies
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        gcc \
        libpq-dev \
        curl \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better caching
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt

# Copy all application code to working directory
COPY . .

# Debug: List files to verify structure
RUN ls -la /app/ && echo "Python path: $PYTHONPATH" && python -c "import sys; print('Python sys.path:', sys.path)"

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# Test simple app first, then try main app
CMD ["sh", "-c", "echo 'Testing simple app...' && python -c 'import simple_test; print(\"simple_test imported OK\")' && echo 'Testing main app...' && python -c 'import main; print(\"main imported OK\")' && python -m uvicorn main:app --host 0.0.0.0 --port 8000"]