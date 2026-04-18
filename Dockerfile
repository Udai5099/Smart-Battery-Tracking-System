FROM python:3.9-slim

# Install Node.js for building frontend
RUN apt-get update && apt-get install -y nodejs npm && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Build frontend
COPY frontend/package*.json ./frontend/
WORKDIR /app/frontend
RUN npm install
COPY frontend/ ./
RUN npm run build

# Go back to root
WORKDIR /app

# Setup backend
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Copy built frontend to backend static folder
RUN mkdir -p backend/static
RUN cp -r frontend/build/* backend/static/

EXPOSE 5001

CMD ["python", "backend/api.py"]