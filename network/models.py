from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone


class User(AbstractUser):
    following_set = models.ManyToManyField('self', related_name='followed_by_set', blank=True)

class Post(models.Model):
    creator = models.ForeignKey(User, on_delete=models.CASCADE)
    content = models.TextField()
    created_at = models.DateTimeField(default=timezone.now)
    liked_by_set = models.ManyToManyField(User, related_name="liked_posts_set", blank=True)

    def serialize(self):
        return {
            'id': self.id,
            'creator': self.creator.username,
            'content': self.content,
            'created_at': self.created_at,
        }


