from os import environ

import requests

SNAPSHOTTER_SVC_URL = environ.get("SNAPSHOTTER_SVC_URL")


def make_snapshot_request(video_url):
    if SNAPSHOTTER_SVC_URL is None:
        raise Exception("No address found for the snapshotter svc")
    response = requests.post(
        SNAPSHOTTER_SVC_URL,
        json={
            "video_url": video_url,
        },
    )

    return response.status_code == 201 or response.status_code == 200
