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
        serializer = PostSerializer(data={"content": "I am a post"})
        self.assertTrue(serializer.is_valid())
        serializer.save(creator=user)

    def test_post_has_username_property(self):
        user = mixer.blend("network.User")
        post = mixer.blend("network.Post", creator=user)
        self.assertEqual(post.creator, user)
        serializer = PostSerializer(instance=post)
        self.assertIn(user.username, serializer.data.values())

    def test_username_property_readonly(self):
        user = mixer.blend("network.User")
        serializer = PostSerializer(data={"content": "I am a post", "creator": user.username})
        self.assertTrue(serializer.is_valid())
        self.assertNotIn("creator", serializer.validated_data)

    def test_content_must_be_not_empty(self):
        serializer = PostSerializer(data={"content": ""})
        self.assertFalse(serializer.is_valid())