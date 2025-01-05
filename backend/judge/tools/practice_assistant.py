import time

from openai import OpenAI

client = OpenAI()

assistant = client.beta.assistants.create(
    name="Travel Image Analyzer",
    instructions="You analyze images and answer true or false: is the image related to travel? This includes, but is not limited to being in an airplane or at an airport, eating food or drinking somewhere abroad, or photos of general sightseeing views.",
    tools=[{"type": "file_search"}],
    model="gpt-4o-mini",
)

image_url = "https://scontent.xx.fbcdn.net/v/t1.15752-9/462584745_838923328246837_1608395828855778606_n.jpg?stp=dst-jpg_p480x480_tt6&_nc_cat=109&ccb=1-7&_nc_sid=0024fc&_nc_ohc=OrocyVoNhSQQ7kNvgHj3iYH&_nc_ad=z-m&_nc_cid=0&_nc_zt=23&_nc_ht=scontent.xx&oh=03_Q7cD1gEph3vpSW65EWCjt8rCxuKWS4BOqoXK55PDz6OWu_KX6g&oe=6796A5A8"

start = time.time()
thread = client.beta.threads.create()
message = client.beta.threads.messages.create(
    thread_id=thread.id,
    role="user",
    content=[
        {
            "type": "image_url",
            "image_url": {
                "url": image_url,
            },
        },
    ],
)
run = client.beta.threads.runs.create_and_poll(
    thread_id=thread.id,
    assistant_id=assistant.id,
    instructions="Is the given image related to travel? Only answer exactly 'True' or 'False'",
)
if run.status == "completed":
    messages = client.beta.threads.messages.list(thread_id=thread.id)
    print(messages)

end = time.time()
print(f"Completion in {end-start}")
