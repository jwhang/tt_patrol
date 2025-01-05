FROM python:3.13.1-bookworm

WORKDIR /app

# Snapshots are written to this directory.
RUN mkdir -p /app/snapshots

# Needed for the openCV dependency
RUN apt-get update && apt-get install ffmpeg libsm6 libxext6  -y

COPY requirements.txt ./

RUN pip install -r requirements.txt

COPY . .

EXPOSE 4001

CMD [ "./run_app.sh" ]
