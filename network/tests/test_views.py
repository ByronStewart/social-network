from unittest import skip
from django.test import TestCase, RequestFactory
from rest_framework.test import APIRequestFactory, force_authenticate
from mixer.backend.django import mixer
from rest_framework import status

from network.models import Post, User
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
        owner = mixer.blend("network.User")
        mixer.blend("network.Post", id=1, owner=owner)
        new_post = {"content": "hello again"}
        req = APIRequestFactory().put("/", data=new_post)
        res = self.view(req, pk=1)
        self.assertEqual(res.status_code, 403,
                            "unauthenticated user cannot change post")
        user = mixer.blend("network.User")
        req = APIRequestFactory().put("/", data=new_post)
        force_authenticate(req, user=user)
        self.assertEqual(
            res.status_code, 403, "authenticated but incorrect user cannot change post")

    def test_change_post_content_updates_post(self):
        user = mixer.blend("network.User")
        mixer.blend("network.Post", id=1, owner=user)
        new_post = {"content": "hello again"}
        req = APIRequestFactory().put("/", data=new_post)
        force_authenticate(req, user=user)
        res = self.view(req, pk=1)
        self.assertEqual(res.status_code, 200, "owner of post can edit post")
        post = Post.objects.get(pk=1)
        self.assertEqual(
            post.content, new_post["content"], "post should be changed to reflect update")

    def test_destroy_post_deletes_post(self):
        user = mixer.blend("network.User")
        mixer.blend("network.Post", id=1, owner=user)
        req = APIRequestFactory().delete("/")
        force_authenticate(req, user=user)
        res = self.view(req, pk=1)
        self.assertEqual(res.status_code, 204, "post should be able to be deleted")

class TestPostLikesAPIView(TestCase):
    def setUp(self):
        self.view = views.PostLikesAPIView.as_view()
        self.user :User = mixer.blend("network.User")

        self.unauthenticated_post_request = APIRequestFactory().post("/")
        self.unauthenticated_delete_request = APIRequestFactory().delete("/")

        self.authenticated_post_request = APIRequestFactory().post("/")
        force_authenticate(self.authenticated_post_request, self.user)

        self.authenticated_delete_request = APIRequestFactory().delete("/")
        force_authenticate(self.authenticated_delete_request, self.user)



    def test_endpoint_requires_pk(self):
        res = self.view(self.authenticated_post_request)
        self.assertEqual(res.status_code, status.HTTP_404_NOT_FOUND)

    
    def test_endpoint_requires_auth(self):
        res = self.view(self.unauthenticated_post_request, pk=2)
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)

        res = self.view(self.unauthenticated_delete_request, pk=2)
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)


    def test_endpoint_returns_404_when_post_does_not_exist(self):
        res = self.view(self.authenticated_post_request, pk=1)
        self.assertEqual(res.status_code, status.HTTP_404_NOT_FOUND)

        res = self.view(self.authenticated_delete_request, pk=1)
        self.assertEqual(res.status_code, status.HTTP_404_NOT_FOUND)


    def test_can_like_post(self):
        post = mixer.blend("network.Post", pk=1)
        response = self.view(self.authenticated_post_request, pk=1)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        user = User.objects.get(pk=self.user.pk)
        post_is_liked = user.liked_posts_set.filter(pk=post.pk).exists()
        self.assertTrue(post_is_liked)
    
    def test_can_unlike_post(self):
        post = mixer.blend("network.Post", pk=1)
        self.user.like(post)
        self.assertTrue(self.user.has_liked(post))
        response = self.view(self.authenticated_delete_request, pk=1)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(self.user.has_liked(post))
     
        
