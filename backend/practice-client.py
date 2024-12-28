import time

from openai import OpenAI
from pydantic import BaseModel

client = OpenAI()


class ImageAnalysisSimple(BaseModel):
    is_travel_image: bool


class ImageAnalysis(BaseModel):
    is_travel_image: bool
    explanation: str


image_url = "https://scontent.xx.fbcdn.net/v/t1.15752-9/462584745_838923328246837_1608395828855778606_n.jpg?stp=dst-jpg_p480x480_tt6&_nc_cat=109&ccb=1-7&_nc_sid=0024fc&_nc_ohc=OrocyVoNhSQQ7kNvgHj3iYH&_nc_ad=z-m&_nc_cid=0&_nc_zt=23&_nc_ht=scontent.xx&oh=03_Q7cD1gEph3vpSW65EWCjt8rCxuKWS4BOqoXK55PDz6OWu_KX6g&oe=6796A5A8"

start = time.time()
completion = client.beta.chat.completions.parse(
    model="gpt-4o-mini",
    messages=[
        {
            "role": "developer",
            "content": [
                {
                    "type": "text",
                    "text": "You analyze images and answer true or false: is the image related to travel? This includes, but is not limited to being in an airplane or at an airport, eating food or drinking somewhere abroad, or photos of general sightseeing views. Limit the explanation to 200 characters",
                },
            ],
        },
        {
            "role": "user",
            "content": [
                {
                    "type": "image_url",
                    "image_url": {
                        "url": image_url,
                    },
                },
            ],
        },
    ],
    response_format=ImageAnalysis,
)

end = time.time()
print(f"Completion with explanation: {end-start}")
print(completion.choices[0].message)


start = time.time()
completion = client.chat.completions.create(
    model="gpt-4o-mini",
    messages=[
        {
            "role": "developer",
            "content": [
                {
                    "type": "text",
                    "text": "You analyze images and answer only 'true' or 'false': is the image related to travel? This includes, but is not limited to being in an airplane or at an airport, eating food or drinking somewhere abroad, or photos of general sightseeing views.",
                },
            ],
        },
        {
            "role": "user",
            "content": [
                {
                    "type": "image_url",
                    "image_url": {
                        "url": image_url,
                    },
                },
            ],
        },
    ],
)
end = time.time()
print(f"Completion without explanation: {end-start}")


print(completion.choices[0].message)
