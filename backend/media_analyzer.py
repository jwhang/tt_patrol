from enum import Enum

import openai_client
import video_snapshotter

IMAGE_FILETYPES = ["jpg", "png"]
VIDEO_FILETYPES = ["mp4"]


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
    video_snapshotter.snapshot(video_url)
