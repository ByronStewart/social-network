from unittest import skip
from django.test import TestCase
from mixer.backend.django import mixer
from .. serializers import UserSerializer, PostSerializer

class TestUserSerializer(TestCase):
    def test_can_create_serializer(self):
        serializer = UserSerializer()
        self.assertIsNotNone(serializer)

    @skip(reason=".")
    def test_can_save(self):
        serializer = UserSerializer(data={"username": "I am a post"})
        self.assertTrue(serializer.is_valid())
        serializer.save()

    
class TestPostSerializer(TestCase):
    def test_can_create_serializer(self):
        serializer = PostSerializer()
        self.assertIsNotNone(serializer)

    def test_can_save(self):
        user = mixer.blend("network.User")
        serializer = PostSerializer(data={"content": "I am a post", "creator_id": user.pk})
        self.assertTrue(serializer.is_valid())
        print(serializer.validated_data)
        serializer.save()
