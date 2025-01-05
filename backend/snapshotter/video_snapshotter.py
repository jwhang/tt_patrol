import datetime

import cv2


def snapshot_and_save(video_url):
    # Open the video file
    capture = cv2.VideoCapture(video_url)

    # Set the frame number (e.g., 100th frame)
    frame_number = 0
    capture.set(cv2.CAP_PROP_POS_FRAMES, frame_number)

    # Read the frame
    success, frame = capture.read()

    if not success:
        raise Exception(f"Failed to capture the frame from {video_url}")

    filename = "/app/snapshots/{date:%Y-%m-%d_%H:%M:%S}.jpg".format(
        date=datetime.datetime.now()
    )

    if not cv2.imwrite(filename, frame):
        raise Exception(f"Failed to write snapshot of {video_url}")

    capture.release()
    return filename
