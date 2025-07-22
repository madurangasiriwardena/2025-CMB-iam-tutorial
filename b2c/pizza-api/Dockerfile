# Development stage
FROM python:3.11-alpine AS development

WORKDIR /python-docker

# Copy the requirements file and install dependencies
COPY requirements.txt requirements.txt
RUN pip3 install -r requirements.txt

# Copy the application code
COPY . .

# Run tests (optional)
CMD ["python3", "test_ietf_flows.py", "-v"]

# Production stage
FROM python:3.11-alpine AS production

WORKDIR /python-docker

# Install system dependencies for PostgreSQL
RUN apk add --no-cache gcc musl-dev postgresql-dev curl

# Copy only the necessary files for production
COPY requirements.txt requirements.txt
RUN pip3 install -r requirements.txt

COPY . .

# Create a new user with UID 10016 (WSO2 Choreo requirement)
RUN addgroup -g 10016 choreo && \
    adduser --disabled-password --no-create-home --uid 10016 --ingroup choreo choreouser

# Switch to the new user
USER 10016

EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# Start the FastAPI application
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]