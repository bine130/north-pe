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

# Health check (Note: Render will handle health checks, this is optional)
# HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
#     CMD curl -f http://localhost:${PORT:-8000}/health || exit 1

# Try simple main first, then full main if it works
CMD python -m uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}