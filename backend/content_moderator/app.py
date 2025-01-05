import logging
from os import environ

import media_analyzer
from flask import Flask, jsonify, make_response, request
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)
app.config["SQLALCHEMY_DATABASE_URI"] = environ.get("DB_URL")
db = SQLAlchemy(app)


class MediaFile(db.Model):
    __tablename__ = "media_files"

    url = db.Column(db.String(1000), unique=True, nullable=False, primary_key=True)
    is_violation = db.Column(db.Boolean, unique=False, nullable=False)

    def json(self):
        return {"url": self.url, "is_violation": self.is_violation}


def setup_logging():
    app.logger.addHandler(logging.StreamHandler())
    if app.debug:
        app.logger.setLevel(logging.INFO)
    else:
        app.logger.setLevel(logging.ERROR)


with app.app_context():
    setup_logging()
    db.create_all()


# create a test route
@app.route("/test", methods=["GET"])
def test():
    return make_response(jsonify({"message": "test route"}), 200)


# create a media_file
@app.route("/media_files", methods=["POST"])
def create_media_file(url=None):
    try:
        if url == None:
            data = request.get_json()
            if "url" not in data:
                raise Exception("Invalid request, body must container 'url'")
            url = data["url"]

        # This is an expensive query (~2-3s). Since the expected traffic
        # beahvior is that create_media_file is bursty for the same url,
        # this could lead to multiple calls to OpenAI for the same media_file.
        #
        # If this service was deployed with multiple instances, then such
        # a queue-worker scheme would be appropriate. However, since a
        # single instance is expected to handle ~6 concurrent users, the
        # current design is sufficient.
        content_analysis = media_analyzer.analyze_content(url)

        new_media_file = MediaFile(
            url=url, is_violation=content_analysis.is_travel_content
        )
        db.session.add(new_media_file)
        db.session.commit()
        return make_response(new_media_file.json(), 201)
    except Exception as e:
        return make_response(
            jsonify({"message": f"error creating media_file", "exception": str(e)}), 500
        )


# get all media_files
@app.route("/media_files", methods=["GET"])
def get_media_files():
    try:
        media_files = MediaFile.query.all()
        return make_response(
            jsonify([media_file.json() for media_file in media_files]), 200
        )
    except Exception as e:
        return make_response(
            jsonify({"message": f"error getting media_files", "exception": str(e)}), 500
        )


# get a media_file by url
@app.route("/media_files/<path:url>", methods=["GET"])
def get_media_file(url):
    try:
        media_file = MediaFile.query.filter_by(url=url).first()
        if media_file:
            return make_response(media_file.json(), 200)
        return make_response(jsonify({"message": "media_file not found"}), 404)
    except Exception as e:
        return make_response(
            jsonify({"message": f"error getting media_file", "exception": str(e)}), 500
        )


# Combines the POST/GET. GET if exists, if not, then POST and GET.
@app.route("/media_files/<path:url>", methods=["PUT"])
def get_or_create(url):
    lookup_resp = get_media_file(url)
    if lookup_resp.status_code != 404:
        return lookup_resp

    return create_media_file(url)


# delete a media_file
# TODO(jwhang): Protect DELETE with an API key.
@app.route("/media_files/<path:url>", methods=["DELETE"])
def delete_media_file(url):
    try:
        media_file = MediaFile.query.filter_by(url=url).first()
        if media_file:
            db.session.delete(media_file)
            db.session.commit()
            return make_response(jsonify({"message": "media_file deleted"}), 200)
        return make_response(jsonify({"message": "media_file not found"}), 404)
    except Exception as e:
        return make_response(
            jsonify({"message": f"error deleting media_file", "exception": str(e)}), 500
        )
