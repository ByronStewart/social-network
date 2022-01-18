from rest_framework import serializers
from .models import User, Post


class PostSerializer(serializers.ModelSerializer):
    owner = serializers.CharField(read_only=True, source='owner.username')
    is_liked = serializers.SerializerMethodField()

    def get_is_liked(self, instance):
        request = self.context.get('request', None)

        if request is None:
            return False

        if not request.user.is_authenticated:
            return False

        return request.user.has_liked(instance)

    class Meta:
        model = Post
        fields = ('id', 'content', 'created_at', 'like_count', 'owner', 'is_liked')
        read_only_fields = ('created_at',)


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'follower_count', 'following_count')
        read_only_fields = ('username',)
