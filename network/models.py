from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    following_set = models.ManyToManyField(
        'self',
        related_name='follower_set',
        blank=True,
        symmetrical=False
    )

    @property
    def follower_count(self):
        return self.follower_set.count()

    @property
    def following_count(self):
        return self.following_set.count()
