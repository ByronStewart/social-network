from unittest import skip
from django.test import TestCase, RequestFactory
from rest_framework.test import APIRequestFactory, force_authenticate
from mixer.backend.django import mixer
from .. import views
from ..serializers import PostSerializer

class TestSanity(TestCase):
    def test_sanity(self):
        self.assertTrue(True)


class TestIndexView(TestCase):
    def test_can_be_viewed_by_all_users(self):
        req = RequestFactory().get("/")
        res = views.IndexView.as_view()(req)
        self.assertEqual(res.status_code, 200,
                         "Should be viewable by all users")


class TestProfileView(TestCase):
    def test_can_be_viewed_by_all_users(self):
        req = RequestFactory().get("/")
        res = views.ProfileView.as_view()(req)
        self.assertEqual(res.status_code, 200,
                         "Should be viewable by all users")


class TestFollowingView(TestCase):
    def test_can_be_viewed_by_all_users(self):
        req = RequestFactory().get("/")
        res = views.FollowingView.as_view()(req)
        self.assertEqual(res.status_code, 200,
                         "Should be viewable by all users")


class TestPostListCreateAPIView(TestCase):
    def setUp(self) -> None:
        self.view = views.PostListCreateAPIView.as_view()
        self.valid_post = {
            "content": "my first post",
            "creator_id": 1
        }

    def test_list_can_be_viewed_by_all_users(self):
        req = APIRequestFactory().get("/")
        res = self.view(req)
        self.assertEqual(res.status_code, 200,
                         "Should be viewable by all users")

    def test_list_should_return_list_of_posts(self):
        posts = []
        for i in range(5):
            posts.append(mixer.blend("network.Post"))
        req = APIRequestFactory().get("/")
        res = self.view(req)
        self.assertEqual(len(res.data), 5)

    @skip(reason="not now")
    def test_create_valid_post(self):
        user = mixer.blend("network.User")
        req = APIRequestFactory().post("/", data=self.valid_post, format='json')
        force_authenticate(req, user=user)
        res = self.view(req)
        print(res)