FROM python:3.11-slim

WORKDIR /app

COPY ai_python/requirements.txt ./
RUN --mount=type=cache,target=/root/.cache/pip pip install -r requirements.txt

COPY ai_python/ ./

EXPOSE 5000

CMD ["python", "main.py"]
