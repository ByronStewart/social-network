from unittest import skip
from django.test import TestCase, RequestFactory
from rest_framework.test import APIRequestFactory, force_authenticate
from mixer.backend.django import mixer

from network.models import Post
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

    def test_authenticated_user_can_create_post(self):
        user = mixer.blend("network.User")
        req = APIRequestFactory().post(
            "/", data={"content": "hello"}, format='json')
        force_authenticate(req, user=user)
        res = self.view(req)
        self.assertEqual(res.status_code, 201)

    def test_anonymous_user_cannot_create_post(self):
        user = mixer.blend("network.User")
        req = APIRequestFactory().post(
            "/", data={"content": "hello"}, format='json')
        res = self.view(req)
        self.assertEqual(res.status_code, 403)

class TestPostRetrieveUpdateDestroyAPIView(TestCase):
    def setUp(self):
        self.view = views.PostRetrieveUpdateDestroyAPIView.as_view()

    def test_retrieve_viewable_by_all_users(self):
        mixer.blend("network.Post", id=1)
        req = APIRequestFactory().get("/")
        res = self.view(req, pk=1)
        self.assertEqual(res.status_code, 200)

    def test_retrieve_returns_404_for_no_post(self):
        mixer.blend("network.Post", id=2)
        req = APIRequestFactory().get("/")
        res = self.view(req, pk=1)
        self.assertEqual(res.status_code, 404)

    def test_post_only_updateable_by_owner(self):
        user = mixer.blend("network.User")
        mixer.blend("network.Post", id=1, owner=user)
        new_post = {"content": "hello again"}
        req = APIRequestFactory().put("/", data=new_post)
        res = self.view(req, pk=1)
        self.assertNotEqual(res.status_code, 200)
    
    def test_update_post_updates_post(self):
        user = mixer.blend("network.User")
        mixer.blend("network.Post", id=1, owner=user)
        new_post = {"content": "hello again"}
        req = APIRequestFactory().put("/", data=new_post)
        self.view(req, pk=1)
        post = Post.objects.get(pk=1)
        self.assertEqual(post.content, new_post["content"])