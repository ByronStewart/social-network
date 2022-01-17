from django.utils import timezone
from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    following_set = models.ManyToManyField(
        'self',
        related_name='follower_set',
        blank=True,
        symmetrical=False
    )
    liked_posts_set = models.ManyToManyField('Post',
        related_name='liked_by_set'
    )

    @property
    def follower_count(self):
        return self.follower_set.count()

    @property
    def following_count(self):
        return self.following_set.count()

class Post(models.Model):
    owner = models.ForeignKey(User, on_delete=models.CASCADE)
    content = models.TextField()
    created_at = models.DateTimeField(default=timezone.now)

    @property
    def like_count(self):
        return self.liked_by_set.count()

    def is_liked_by(self, user: User):
        return self.liked_by_set.filter(pk=user.pk).exists()

