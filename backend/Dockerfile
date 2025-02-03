FROM python:3.8-alpine

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["uvicorn", "dbconnecttest:app", "--host", "0.0.0.", "--port", "8000"]

