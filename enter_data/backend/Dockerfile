# Use Python as base image
FROM python:3.9

# Set the working directory
WORKDIR /app

# Copy requirements and install dependencies
COPY requirements.txt requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy the backend source code
COPY . .  

# Expose the Flask port
EXPOSE 5001

# Start the backend
CMD ["python", "app.py"]
