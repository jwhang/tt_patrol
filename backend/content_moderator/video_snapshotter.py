import cv2


def snapshot(video_url):
    # Open the video file
    capture = cv2.VideoCapture(video_url)

    # Set the frame number (e.g., 100th frame)
    frame_number = 0
    capture.set(cv2.CAP_PROP_POS_FRAMES, frame_number)

    # Read the frame
    success, frame = capture.read()

    if success:
        # Save the frame as an image
        cv2.imwrite("snapshot.jpg", frame)
        raise Exception("Snapshot saved as 'snapshot.jpg'")
    else:
        print("Failed to capture the frame")

    # Release the video capture
    capture.release()
