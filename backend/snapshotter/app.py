import logging
from os import path, remove

import video_snapshotter
from flask import Flask, jsonify, make_response, request, send_file
from flask_caching import Cache

app = Flask(__name__)
cache = Cache(
    config={
        "CACHE_TYPE": "filesystem",
        "CACHE_DIR": "/tmp",
        "CACHE_DEFAULT_TIMEOUT": 1200,
    }
)
cache.init_app(app)


# Only create one instance of Snapshot. It is wrapper around the Flask cache.
class Snapshot:
    @staticmethod
    def getSnapshotFilepath(video_url):
        return cache.get(video_url)

    @staticmethod
    def getAllSnapshots():
        raise Exception(
            "Unsupported because Flask filesystem cache does not support looking up all keys."
        )

    @staticmethod
    def putSnapshot(video_url, snapshot_filepath):
        cache.set(video_url, snapshot_filepath)


snapshot_cache = Snapshot()


def setup_logging():
    app.logger.addHandler(logging.StreamHandler())
    if app.debug:
        app.logger.setLevel(logging.INFO)
    else:
        app.logger.setLevel(logging.ERROR)


with app.app_context():
    setup_logging()


# Create a test route.
@app.route("/test", methods=["GET"])
def test():
    return make_response(jsonify({"message": "test route"}), 200)


# Create a snapshot.
@app.route("/snapshots", methods=["POST"])
def create_snapshot(video_url=None):
    snapshot_file = None
    try:
        if video_url == None:
            data = request.get_json()
            video_url = data["video_url"]

        snapshot_file = video_snapshotter.snapshot_and_save(video_url)

        snapshot_cache.putSnapshot(video_url=video_url, snapshot_filepath=snapshot_file)
        return make_response(jsonify({"message": f"succesfully created snapshot"}), 201)
    except Exception as e:
        # If there was a problem with the database commit, then remove the file.
        if snapshot_file is not None:
            remove(snapshot_file)
        return make_response(
            jsonify({"message": f"error creating snapshot", "exception": str(e)}), 500
        )


# Get all snapshots.
@app.route("/snapshots", methods=["GET"])
def get_snapshots():
    return make_response(
        jsonify(
            {
                "message": "error getting snapshots",
                "exception": "unsupported endpoint",
            },
        ),
        500,
    )


# Get a snapshot by video_url.
@app.route("/snapshots/<path:video_url>", methods=["GET"])
def get_snapshot(video_url):
    try:
        snapshot_filepath = snapshot_cache.getSnapshotFilepath(video_url)
        if not snapshot_filepath:
            return make_response(jsonify({"message": "snapshot not found"}), 404)
        return send_file(snapshot_filepath, "image/gif")

    except Exception as e:
        return make_response(
            jsonify({"message": f"error getting snapshot", "exception": str(e)}), 500
        )


# Combines the POST/GET. GET if exists, if not, then POST and GET.
@app.route("/snapshots/<path:video_url>", methods=["PUT"])
def get_or_create(video_url):
    lookup_resp = get_snapshot(video_url)
    if lookup_resp.status_code != 404:
        return lookup_resp

    return create_snapshot(video_url)


# Delete a snapshot
@app.route("/snapshots/<path:video_url>", methods=["DELETE"])
def delete_snapshot(video_url):
    return make_response(
        jsonify(
            {"message": f"error deleting snapshot", "exception": "unsupported endpoint"}
        ),
        500,
    )
