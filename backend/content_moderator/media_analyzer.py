from enum import Enum
from os import environ

import requests

import openai_client
import video_snapshotter

IMAGE_FILETYPES = ["jpg", "png"]
VIDEO_FILETYPES = ["mp4"]
SNAPSHOTTER_SVC_URL = environ.get("SNAPSHOTTER_SVC_URL")


class MediaType(Enum):
    IMAGE = 1
    VIDEO = 2
    UNKNOWN = 3


def getMediaType(url):
    parsed = url.split("?")
    if len(parsed) == 0:
        return MediaType.UNKNOWN
    filename = parsed[0]
    for ft in IMAGE_FILETYPES:
        if filename.endswith(ft):
            return MediaType.IMAGE
    for ft in VIDEO_FILETYPES:
        if filename.endswith(ft):
            return MediaType.VIDEO
    return MediaType.UNKNOWN


def analyze_content(url):
    media_type = getMediaType(url)
    if media_type == MediaType.UNKNOWN:
        raise Exception("Unknown file type for {url}")
    elif media_type == MediaType.IMAGE:
        return openai_client.analyze_image(url)
    elif media_type == MediaType.VIDEO:
        return analyze_video(url)


def analyze_video(video_url):
    if not video_snapshotter.make_snapshot_request(video_url):
        raise Exception("Failed to make snapshot request.")
    if SNAPSHOTTER_SVC_URL is None:
        raise Exception("No address found for the snapshotter svc")
    snapshot_url = (
        f"{SNAPSHOTTER_SVC_URL}/snapshots/{requests.utils.requote_uri(video_url)}"
    )
    return analyze_video(snapshot_url)
