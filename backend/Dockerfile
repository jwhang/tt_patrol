FROM python:3.13.1-bookworm

WORKDIR /app

COPY requirements.txt ./

RUN pip install -r requirements.txt

COPY . .

EXPOSE 4000

CMD [ "./run_app.sh" ]
