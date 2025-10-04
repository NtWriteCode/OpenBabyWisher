FROM python:3-slim

# Set working directory
WORKDIR /app

# Install system dependencies for Pillow, notifications, and health checks
RUN apt-get update && apt-get install -y \
    gcc \
    curl \
    libjpeg-dev \
    zlib1g-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better caching
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Download Shoutrrr binary for notifications with verification
# Use TARGETARCH to download the correct architecture
RUN mkdir -p bin && \
    ARCH=$(uname -m) && \
    if [ "$ARCH" = "x86_64" ]; then SHOUTRRR_ARCH="amd64"; \
    elif [ "$ARCH" = "aarch64" ]; then SHOUTRRR_ARCH="arm64"; \
    else SHOUTRRR_ARCH="$ARCH"; fi && \
    echo "Downloading Shoutrrr for architecture: $SHOUTRRR_ARCH" && \
    curl -fsSL "https://github.com/containrrr/shoutrrr/releases/latest/download/shoutrrr_linux_${SHOUTRRR_ARCH}.tar.gz" | \
    tar -xz -C bin/ && \
    chmod +x bin/shoutrrr && \
    bin/shoutrrr --version

# Create directories (will be replaced by mounted volumes at runtime)
# Note: When using docker-compose with mounted volumes and 'user:' directive,
# ensure the UID matches your host user (run: id -u && id -g)
RUN mkdir -p uploads data && \
    useradd --create-home --shell /bin/bash app && \
    chown -R app:app /app && \
    chmod -R 755 /app/uploads /app/data

USER app

# Expose port
EXPOSE 5000

# Ensure Python output isn't buffered (important for Docker logs)
ENV PYTHONUNBUFFERED=1

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:5000/ || exit 1

# Run the application
CMD ["python", "app.py"]