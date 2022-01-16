from rest_framework import serializers
from .models import User, Post


class PostSerializer(serializers.ModelSerializer):
    creator=serializers.CharField(read_only=True, source='creator.username')
    class Meta:
        model = Post
        fields = ('id', 'content', 'created_at', 'like_count', 'creator')


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'follower_count', 'following_count')