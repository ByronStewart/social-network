from django.test import TestCase
from mixer.backend.django import mixer


class TestUserModel(TestCase):
    def test_model(self):
        obj = mixer.blend("network.User")
        self.assertEqual(obj.pk, 1, "should create a user instance")

    def test_user_can_follow_other_users(self):
        user1 = mixer.blend("network.User")
        user2 = mixer.blend("network.User")
        user1.following_set.add(user2)
        self.assertEqual(user2.follower_count, 1)
        self.assertEqual(user1.following_count, 1)

    def test_user_can_be_followed_by_other_users(self):
        user1 = mixer.blend("network.User")
        user2 = mixer.blend("network.User")
        user2.follower_set.add(user1)
        self.assertEqual(user2.follower_count, 1)
        self.assertEqual(user1.following_count, 1)
    
    def test_user_can_like_post(self):
        user = mixer.blend("network.User")
        post = mixer.blend("network.Post")
        user.like(post)
        self.assertEqual(post.like_count, 1)

class TestPostModel(TestCase):
    def test_model(self):
        obj = mixer.blend("network.Post")
        self.assertEqual(obj.pk, 1, "should create a post instance")

    def test_if_post_is_liked_by_user(self):
        user = mixer.blend("network.User")
        post = mixer.blend("network.Post")
        self.assertFalse(post.is_liked_by(user), "should return false if user has not liked post")
        user.liked_posts_set.add(post)
        self.assertTrue(post.is_liked_by(user), "should return true if user has liked post")