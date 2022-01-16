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
