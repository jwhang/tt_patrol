#!/bin/bash

echo FLASK_ENV = $FLASK_ENV
if [[ "$FLASK_ENV" == "development" ]]; then
        flask --debug run --host=0.0.0.0 --port=4001
fi

if [[ "$FLASK_ENV" == "production" ]]; then
        gunicorn --bind 0.0.0.0:4001 app:app
fi
