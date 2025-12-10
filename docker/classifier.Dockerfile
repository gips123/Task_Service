FROM python:3.11-slim

WORKDIR /app

COPY classifier_service/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY classifier_service/ ./

EXPOSE 5001

CMD ["python", "main.py"]


