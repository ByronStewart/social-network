from django.contrib.auth.models import AbstractUser
from django.db import models
from django.http.request import HttpRequest
from django.utils import timezone


class User(AbstractUser):
    following_set = models.ManyToManyField(
        'self',
        related_name='followed_by_set',
        blank=True,
        symmetrical=False
    )

    @property
    def follower_count(self):
        return self.followed_by_set.count()

    @property
    def follow_count(self):
        return self.following_set.count()

    def is_followed_by_user(self, request: HttpRequest):
        return request.user.following_set.filter(pk=self.pk).exists()


class Post(models.Model):
    creator = models.ForeignKey(User, on_delete=models.CASCADE)
    content = models.TextField()
    created_at = models.DateTimeField(default=timezone.now)
    liked_by_set = models.ManyToManyField(
        User, related_name="liked_posts_set", blank=True)
        
    @property
    def like_count(self):
        return self.liked_by_set.count()

    def serialize(self, request):
        post = {
            'id': self.id,
            'creator': self.creator.username,
            'creator_id': self.creator.pk,
            'content': self.content,
            'created_at': self.created_at.strftime("%b %d %Y, %I:%M %p"),
            'likes': self.like_count
        }
        if request.user.is_authenticated:
            post["is_liked"] = self.is_liked(request)
        return post
    
    def is_liked(self, request) -> bool :
        return request.user.liked_posts_set.filter(pk=self.pk).exists()

    class Meta:
        ordering = ['-created_at']
