FROM python:3.13.1-bookworm

WORKDIR /app

COPY requirements.txt ./

RUN pip install -r requirements.txt

# Needed for the openCV dependency
RUN apt-get update && apt-get install ffmpeg libsm6 libxext6  -y

COPY . .

EXPOSE 4000

CMD [ "./run_app.sh" ]
