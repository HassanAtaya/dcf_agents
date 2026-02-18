FROM python:3.11-slim

WORKDIR /app

COPY ai_python/requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

COPY ai_python/ ./ai_python/

EXPOSE 5000

CMD ["python", "-m", "ai_python.main"]
