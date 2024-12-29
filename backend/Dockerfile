FROM python:3.13.1-bookworm

WORKDIR /app

COPY requirements.txt ./

RUN pip install -r requirements.txt

COPY . .

EXPOSE 4000

CMD [ "flask", "run", "--host=0.0.0.0", "--port=4000"]
# CMD [ "gunicorn", "--bind", "0.0.0.0:4000", "app:app"]
