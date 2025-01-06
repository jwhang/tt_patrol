import logging
from os import environ

import media_analyzer
from flask import Flask, jsonify, make_response, request
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)
app.config["SQLALCHEMY_DATABASE_URI"] = environ.get("DB_URL")
db = SQLAlchemy(app)


class Judgement(db.Model):
    __tablename__ = "judgements"

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


# create a judgement
@app.route("/judgements", methods=["POST"])
def create_judgement(url=None):
    try:
        if url == None:
            data = request.get_json()
            if "url" not in data:
                raise Exception("Invalid request, body must container 'url'")
            url = data["url"]

        # This is an expensive query (~2-3s). Since the expected traffic
        # beahvior is that create_judgement is bursty for the same url,
        # this could lead to multiple calls to OpenAI for the same judgement.
        #
        # If this service was deployed with multiple instances, then such
        # a queue-worker scheme would be appropriate. However, since a
        # single instance is expected to handle ~6 concurrent users, the
        # current design is sufficient.
        content_analysis = media_analyzer.analyze_content(url)

        new_judgement = Judgement(
            url=url, is_violation=content_analysis.is_travel_content
        )
        db.session.add(new_judgement)
        db.session.commit()
        return make_response(new_judgement.json(), 201)
    except Exception as e:
        return make_response(
            jsonify({"message": f"error creating judgement", "exception": str(e)}), 500
        )


# get all judgements
@app.route("/judgements", methods=["GET"])
def get_judgements():
    try:
        judgements = Judgement.query.all()
        return make_response(
            jsonify([judgement.json() for judgement in judgements]), 200
        )
    except Exception as e:
        return make_response(
            jsonify({"message": f"error getting judgements", "exception": str(e)}), 500
        )


# get a judgement by url
@app.route("/judgements/<path:url>", methods=["GET"])
def get_judgement(url):
    try:
        judgement = Judgement.query.filter_by(url=url).first()
        if judgement:
            return make_response(judgement.json(), 200)
        return make_response(jsonify({"message": "judgement not found"}), 404)
    except Exception as e:
        return make_response(
            jsonify({"message": f"error getting judgement", "exception": str(e)}), 500
        )


# Combines the POST/GET. GET if exists, if not, then POST and GET.
@app.route("/judgements/<path:url>", methods=["PUT"])
def get_or_create(url):
    lookup_resp = get_judgement(url)
    if lookup_resp.status_code != 404:
        return lookup_resp

    return create_judgement(url)


# delete a judgement
# TODO(jwhang): Protect DELETE with an API key.
@app.route("/judgements/<path:url>", methods=["DELETE"])
def delete_judgement(url):
    try:
        judgement = Judgement.query.filter_by(url=url).first()
        if judgement:
            db.session.delete(judgement)
            db.session.commit()
            return make_response(jsonify({"message": "judgement deleted"}), 200)
        return make_response(jsonify({"message": "judgement not found"}), 404)
    except Exception as e:
        return make_response(
            jsonify({"message": f"error deleting judgement", "exception": str(e)}), 500
        )
