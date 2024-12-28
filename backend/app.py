from os import environ

from flask import Flask, jsonify, make_response, request
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)
app.config["SQLALCHEMY_DATABASE_URI"] = environ.get("DB_URL")
db = SQLAlchemy(app)


class Image(db.Model):
    __tablename__ = "images"

    name = db.Column(db.String(600), unique=True, nullable=False, primary_key=True)
    is_violation = db.Column(db.Boolean, unique=True, nullable=False)

    def json(self):
        return {"name": self.name, "is_violation": self.is_violation}


db.create_all()


# create a test route
@app.route("/test", methods=["GET"])
def test():
    return make_response(jsonify({"message": "test route"}), 200)


# create a image
@app.route("/images", methods=["POST"])
def create_image():
    try:
        data = request.get_json()
        new_image = Image(name=data["name"], is_violation=data["is_violation"])
        db.session.add(new_image)
        db.session.commit()
        return make_response(jsonify({"message": "image created"}), 201)
    except e:
        return make_response(jsonify({"message": "error creating image"}), 500)


# get all images
@app.route("/images", methods=["GET"])
def get_images():
    try:
        images = Image.query.all()
        return make_response(jsonify([image.json() for image in images]), 200)
    except e:
        return make_response(jsonify({"message": "error getting images"}), 500)


# get a image by name
@app.route("/images/<name>", methods=["GET"])
def get_image(name):
    try:
        image = Image.query.filter_by(name=name).first()
        if image:
            return make_response(jsonify({"image": image.json()}), 200)
        return make_response(jsonify({"message": "image not found"}), 404)
    except e:
        return make_response(jsonify({"message": "error getting image"}), 500)


# update a image
@app.route("/images/<name>", methods=["PUT"])
def update_image(name):
    try:
        image = Image.query.filter_by(name=name).first()
        if image:
            data = request.get_json()
            image.name = data["name"]
            image.is_violation = data["is_violation"]
            db.session.commit()
            return make_response(jsonify({"message": "image updated"}), 200)
        return make_response(jsonify({"message": "image not found"}), 404)
    except e:
        return make_response(jsonify({"message": "error updating image"}), 500)


# delete a image
@app.route("/images/<name>", methods=["DELETE"])
def delete_image(name):
    try:
        image = Image.query.filter_by(name=name).first()
        if image:
            db.session.delete(image)
            db.session.commit()
            return make_response(jsonify({"message": "image deleted"}), 200)
        return make_response(jsonify({"message": "image not found"}), 404)
    except e:
        return make_response(jsonify({"message": "error deleting image"}), 500)
