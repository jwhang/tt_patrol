from functools import lru_cache

from openai import OpenAI
from pydantic import BaseModel


class ImageAnalysis(BaseModel):
    is_travel_image: bool


# This LRU Cache does not work becas
@lru_cache(maxsize=64)
def analyze_image(image_url):
    client = OpenAI()
    completion = client.beta.chat.completions.parse(
        model="gpt-4o-mini",
        messages=[
            {
                "role": "developer",
                "content": [
                    {
                        "type": "text",
                        "text": "You analyze images and answer true or false: is the image related to travel? This includes, but is not limited to being in an airplane or at an airport, eating food or drinking somewhere abroad, or photos of general sightseeing views.",
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

    response = completion.choices[0].message
    if response.refusal:
        # handle refusal
        raise Exception(
            f"OpenAI refused request for {image_url} due to: {response.refusal}"
        )
    return response.parsed
