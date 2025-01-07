from urllib import parse

from locust import HttpUser, between, task


def get_judgements_url(url):
    encoded_url = parse.quote(url, safe="")
    return f"/judgements/{encoded_url}"


class LoadtestJudge(HttpUser):
    wait_time = between(0.5, 2)
    images_1 = [
        "https://theworldtravelguy.com/wp-content/uploads/2024/09/DSCF2468.jpg",
        "https://cdn.getyourguide.com/img/tour/63f9c0fa638bf.jpeg/98.jpg",
        "https://cdn.getyourguide.com/img/tour/63f9c1912665a.jpeg/vertical_520_780.jpg",
        "https://cdn.getyourguide.com/img/tour/63f9c1aa15909.jpeg/97.jpg",
        "https://theworldtravelguy.com/wp-content/uploads/2024/09/DSCF2487.jpg",
    ]

    images_2 = [
        "https://blog.ricksteves.com/wp-content/uploads/2022/02/comrades-no-more-Russia-Ukraine.jpg",
        "https://blog.ricksteves.com/wp-content/uploads/2021/11/6.rick-back.jpg",
    ]
    images_3 = [
        "https://blog.ricksteves.com/wp-content/uploads/2021/11/4.gear-bag-rotated.jpg",
        "https://blog.ricksteves.com/wp-content/uploads/2021/11/3.sign_.jpg",
    ]

    videos_1 = [
        "https://videos.pexels.com/video-files/2169880/2169880-uhd_2560_1440_30fps.mp4"
    ]

    videos_2 = [
        "https://videos.pexels.com/video-files/29956114/12855671_1440_2560_48fps.mp4"
    ]

    def on_stop(self):
        # Make sure we start off on a clean slate and nothing is cached.
        for url in (
            self.images_1
            + self.images_2
            + self.images_3
            + self.videos_1
            + self.videos_2
        ):
            self.client.delete(get_judgements_url(url))

    @task
    def put_images_1(self):
        for url in self.images_1:
            self.client.put(get_judgements_url(url))

    @task
    def put_images_2(self):
        for url in self.images_2:
            self.client.put(get_judgements_url(url))

    @task
    def put_images_3(self):
        for url in self.images_3:
            self.client.put(get_judgements_url(url))

    @task
    def put_vidoes_1(self):
        for url in self.videos_1:
            self.client.put(get_judgements_url(url))

    @task
    def put_vidoes_2(self):
        for url in self.videos_2:
            self.client.put(get_judgements_url(url))
