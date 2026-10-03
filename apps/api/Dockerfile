FROM python:3.11-slim

WORKDIR /app

# Install system dependencies needed for compiling psycopg and scientific packages
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application source code and models
COPY . .

# Ensure district_features_cache exists
RUN python -c "from pathlib import Path; p = Path('app/ml_models/district_features_cache.csv'); print('Cache file present:', p.exists())" || true

EXPOSE 8000

ENV PORT=8000
ENV PYTHONUNBUFFERED=1

CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
