# Base image
FROM python:3.9-slim

# Set working directory
WORKDIR /app

# Copy requirements file
COPY requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Expose port (will be overridden by environment variable)
ENV PORT=8000
EXPOSE $PORT

# Command to run the application (gunicorn is preferred, but simple python for MVP)
# Assuming a standard 'app:app' or 'main:app' structure, or just running 'python app.py'
# For the MVP, we'll try to guess or use a standard entrypoint.
# Let's use a generic CMD that shells out to a start script if exists, or a default.
CMD ["sh", "-c", "python app.py"]
