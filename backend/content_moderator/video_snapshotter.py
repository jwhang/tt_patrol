import logging
from os import environ

import requests

logger = logging.getLogger(__name__)


SNAPSHOTTER_SVC_URL = environ.get("SNAPSHOTTER_SVC_URL")


def make_snapshot_request(video_url):
    if SNAPSHOTTER_SVC_URL is None:
        raise Exception("No address found for the snapshotter svc")
    snapshots_url = f"{SNAPSHOTTER_SVC_URL}/snapshots"
    response = requests.post(
        snapshots_url,
        json={
            "video_url": video_url,
        },
    )

    if response.status_code != 201:
        logger.error(f"Snapshot response from url '{snapshots_url}': {response.json()}")
    return response.status_code == 201 or response.status_code == 200
