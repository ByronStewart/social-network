from unittest import skip
from django.test import TestCase, RequestFactory
from mixer.backend.django import mixer

from network.models import User
from .. serializers import UserSerializer, PostSerializer
from rest_framework.test import APIRequestFactory, force_authenticate
from django.contrib.auth.models import AnonymousUser


class TestUserSerializer(TestCase):
    def test_can_create_serializer(self):
        serializer = UserSerializer()
        self.assertIsNotNone(serializer)


class TestPostSerializer(TestCase):

    def test_get_is_liked(self):
        post_instance = mixer.blend("network.Post")
        serializer = PostSerializer(post_instance)
        self.assertFalse(serializer.data['is_liked'], "should return false with no request context")

        request = RequestFactory().get('/')
        request.user = AnonymousUser()
        serializer = PostSerializer(post_instance, context={'request':request})
        self.assertFalse(serializer.data['is_liked'], "should return false with no authenticated user")

        request.user = mixer.blend('network.User')
        self.assertFalse(serializer.data['is_liked'], "should return false if user has not liked post")

        request.user.like(post_instance)
        serializer = PostSerializer(post_instance, context={'request':request})
        self.assertTrue(serializer.data['is_liked'], "should return true if user has liked post")


    def test_can_create_serializer(self):
        serializer = PostSerializer()
        self.assertIsNotNone(serializer)

    def test_can_save(self):
        user = mixer.blend("network.User")
        serializer = PostSerializer(data={"content": "I am a post"})
        self.assertTrue(serializer.is_valid())
        serializer.save(owner=user)

    def test_post_has_username_property(self):
        user = mixer.blend("network.User")
        post = mixer.blend("network.Post", owner=user)
        self.assertEqual(post.owner, user)
        serializer = PostSerializer(instance=post)
        self.assertIn(user.username, serializer.data.values())

    def test_username_property_readonly(self):
        user = mixer.blend("network.User")
        serializer = PostSerializer(
            data={"content": "I am a post", "owner": user.username})
        self.assertTrue(serializer.is_valid())
        self.assertNotIn("owner", serializer.validated_data)

    def test_content_must_be_not_empty(self):
        serializer = PostSerializer(data={"content": ""})
        self.assertFalse(serializer.is_valid())
