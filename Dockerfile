FROM python:3-slim

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better caching
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Download Shoutrrr binary for notifications
RUN mkdir -p bin && \
    curl -L https://github.com/containrrr/shoutrrr/releases/latest/download/shoutrrr_linux_amd64.tar.gz | \
    tar -xz -C bin/ && \
    chmod +x bin/shoutrrr

# Create directories with proper permissions
RUN mkdir -p uploads data && \
    useradd --create-home --shell /bin/bash app && \
    chown -R app:app /app
USER app

# Expose port
EXPOSE 5000

# Ensure Python output isn't buffered (important for Docker logs)
ENV PYTHONUNBUFFERED=1

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:5000/ || exit 1

# Run the application
CMD ["python", "app.py"]