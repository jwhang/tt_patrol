import logging
from os import environ

from flask import Flask, jsonify, make_response, request
from flask_sqlalchemy import SQLAlchemy
from openai_client import OpenAIClient

app = Flask(__name__)
app.config["SQLALCHEMY_DATABASE_URI"] = environ.get("DB_URL")
db = SQLAlchemy(app)


class Image(db.Model):
    __tablename__ = "images"

    image_url = db.Column(
        db.String(1000), unique=True, nullable=False, primary_key=True
    )
    is_violation = db.Column(db.Boolean, unique=False, nullable=False)

    def json(self):
        return {"image_url": self.image_url, "is_violation": self.is_violation}


def setup_logging():
    # if not app.debug:
    if True:
        # In production mode, add log handler to sys.stderr.
        app.logger.addHandler(logging.StreamHandler())
        app.logger.setLevel(logging.INFO)


with app.app_context():
    db.create_all()
    setup_logging()


# create a test route
@app.route("/test", methods=["GET"])
def test():
    return make_response(jsonify({"message": "test route"}), 200)


# create a image
@app.route("/images", methods=["POST"])
def create_image():
    try:
        data = request.get_json()
        image_url = data["image_url"]

        openai_client = OpenAIClient()
        image_analysis = openai_client.analyze_image(image_url)

        new_image = Image(
            image_url=data["image_url"], is_violation=image_analysis.is_travel_image
        )
        db.session.add(new_image)
        db.session.commit()
        return make_response(jsonify({"message": "image created"}), 201)
    except Exception as e:
        return make_response(
            jsonify({"message": f"error creating image", "exception": str(e)}), 500
        )


# get all images
@app.route("/images", methods=["GET"])
def get_images():
    try:
        images = Image.query.all()
        return make_response(jsonify([image.json() for image in images]), 200)
    except Exception as e:
        return make_response(
            jsonify({"message": f"error getting images", "exception": str(e)}), 500
        )


# get a image by image_url
@app.route("/images/<path:image_url>", methods=["GET"])
def get_image(image_url):
    try:
        image = Image.query.filter_by(image_url=image_url).first()
        if image:
            return make_response(jsonify({"image": image.json()}), 200)
        return make_response(jsonify({"message": "image not found"}), 404)
    except Exception as e:
        return make_response(
            jsonify({"message": f"error getting image", "exception": str(e)}), 500
        )


# Combines the POST/GET. GET if exists, if not, then POST and GET.
@app.route("/images/<path:image_url>", methods=["PUT"])
def get_or_post(image_url):
    try:
        image = Image.query.filter_by(image_url=image_url).first()
        if image:
            return make_response(jsonify({"image": image.json()}), 200)

        openai_client = OpenAIClient()
        image_analysis = openai_client.analyze_image(image_url)

        new_image = Image(
            image_url=image_url, is_violation=image_analysis.is_travel_image
        )
        db.session.add(new_image)
        db.session.commit()
        return make_response(jsonify({"image": new_image.json()}), 404)
    except Exception as e:
        return make_response(
            jsonify({"message": f"error updating image", "exception": str(e)}), 500
        )


# delete a image
@app.route("/images/<path:image_url>", methods=["DELETE"])
def delete_image(image_url):
    try:
        image = Image.query.filter_by(image_url=image_url).first()
        if image:
            db.session.delete(image)
            db.session.commit()
            return make_response(jsonify({"message": "image deleted"}), 200)
        return make_response(jsonify({"message": "image not found"}), 404)
    except Exception as e:
        return make_response(
            jsonify({"message": f"error deleting image", "exception": str(e)}), 500
        )
