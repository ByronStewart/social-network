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

    def like(self, post):
        """ like a post if we have not already liked it """
        self.liked_posts_set.add(post)

    def unlike(self, post):
        """ unlike a post if we have already liked it """
        self.liked_posts_set.remove(post)

    def has_liked(self, post):
        """ returns True if user has liked 'post'; else False """
        return self.liked_posts_set.filter(pk=post.pk).exists()

    def has_followed(self, user=None, pk=None):
        """ returns True if the user has followed 'user'; else False """
        if not user and not pk:
            return False
        if not pk:
            return self.following_set.filter(pk=user.pk).exists()
        return self.following_set.filter(pk=pk).exists()

    def follow(self, user):
        """ follow a user 'user' """
        return self.following_set.add(user)

    def unfollow(self, user):
        """ follow a user 'user' """
        return self.following_set.remove(user)

class Post(models.Model):
    owner = models.ForeignKey(User, on_delete=models.CASCADE,
        related_name='post_set'
    )
    content = models.TextField()
    created_at = models.DateTimeField(default=timezone.now)

    @property
    def like_count(self):
        return self.liked_by_set.count()


    def is_liked_by(self, user: User):
        return self.liked_by_set.filter(pk=user.pk).exists()

    class Meta:
        ordering = ['-created_at']
