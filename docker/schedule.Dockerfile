FROM python:3.11-slim

WORKDIR /app

COPY schedule_service/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY schedule_service/ ./

EXPOSE 3001

CMD ["python", "main.py"]


