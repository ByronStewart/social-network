from unittest import skip
from django.http import response
from django.test import TestCase, RequestFactory
from django.contrib.auth.models import AnonymousUser
from rest_framework.test import APIRequestFactory, force_authenticate
from mixer.backend.django import mixer
from rest_framework import status
from django.urls import reverse

from network.models import Post, User
from .. import views
from ..serializers import PostSerializer


class TestSanity(TestCase):
    def test_sanity(self):
        self.assertTrue(True)


class TestIndexView(TestCase):
    def setUp(self):
        self.view = views.IndexView.as_view()

    def test_can_be_viewed_by_all_users(self):
        req = RequestFactory().get("/")
        req.user = AnonymousUser()
        res = views.IndexView.as_view()(req)
        self.assertEqual(res.status_code, 200,
                         "Should be viewable by all users")

    def test_contains_posts(self):
        for _ in range(5):
            mixer.blend("network.Post")
        request = RequestFactory().get("/")
        request.user = AnonymousUser()
        response = self.view(request)
        self.assertEqual(len(response.context_data["object_list"]), 5)
    
    def test_paginates_posts_by_10(self):
        for _ in range(15):
            mixer.blend("network.Post")
        request = RequestFactory().get("/")
        request.user = AnonymousUser()
        response = self.view(request)
        self.assertEqual(len(response.context_data["object_list"]), 10)
    
    def test_adds_isliked_to_each_post(self):
        user : User = mixer.blend("network.User")
        for _ in range(15):
            post = mixer.blend("network.Post")
            user.like(post)
        request = RequestFactory().get("/")
        request.user = user
        response = self.view(request)
        for post in response.context_data["object_list"]:
            self.assertTrue(post.is_liked)

class TestProfileDetailView(TestCase):
    @classmethod
    def setUpTestData(cls):
        cls.view = views.ProfileDetailView.as_view()
    
    def setUp(self):
        self.user : User = mixer.blend("network.User", id=1)

    def test_can_be_viewed_by_all_users(self):
        request = RequestFactory().get("/")
        request.user = self.user
        response = self.view(request, pk=1)
        self.assertEqual(response.status_code, 200,
                         "Should be viewable by all users")

    def test_user_is_in_context(self):
        request = RequestFactory().get("/")
        request.user = self.user
        response = self.view(request, pk=1)
        self.assertIsInstance(response.context_data["object"], User)
        self.assertIsInstance(response.context_data["object"], User)

    def test_user_has_isfollowed_attribute(self):
        followed_user = mixer.blend("network.User", id=2)
        self.user.follow(followed_user)
        request = RequestFactory().get("/")
        request.user = self.user
        response = self.view(request, pk=2)
        self.assertTrue(response.context_data["object"].is_followed)
        self.user.unfollow(followed_user)
        response = self.view(request, pk=2)
        self.assertFalse(response.context_data["object"].is_followed)

    def test_view_contains_list_of_posts(self):
        for _ in range(5):
            mixer.blend("network.Post", owner=self.user)
        request = RequestFactory().get("/")
        request.user = self.user
        response = self.view(request, pk=1)
        self.assertEqual(len(response.context_data["post_list"]), 5)
    
    def test_paginates_posts_by_10(self):
        for _ in range(15):
            mixer.blend("network.Post", owner=self.user)
        request = RequestFactory().get("/")
        request.user = AnonymousUser()
        response = self.view(request, pk=1)
        self.assertEqual(len(response.context_data["post_list"]), 10)

    def test_filters_posts_by_user(self):
        for _ in range(3):
            mixer.blend("network.Post", owner=self.user)
            mixer.blend("network.Post")
        request = RequestFactory().get("/")
        request.user = AnonymousUser()
        response = self.view(request, pk=1)
        self.assertEqual(len(response.context_data["object_list"]), 3)

    def test_adds_isliked_to_each_post(self):
        for _ in range(15):
            post = mixer.blend("network.Post")
            self.user.like(post)
        request = RequestFactory().get("/")
        request.user = self.user
        response = self.view(request, pk=1)
        for post in response.context_data["object_list"]:
            self.assertTrue(post.is_liked)

class TestFollowingView(TestCase):

    def test_unauthenticated_users_should_get_redirected_to_login(self):
        request = RequestFactory().get("/")
        request.user = AnonymousUser()
        response = views.FollowingView.as_view()(request)
        self.assertEqual(response.status_code, 302,
                         "Should redirect")
        self.assertRegex(response.url, "login")

    
    def test_should_display_posts_from_followed_users(self):
        user : User = mixer.blend("network.User")
        followed_user = mixer.blend("network.User")
        user.follow(followed_user)
        for _ in range(3):
            mixer.blend("network.Post")
            mixer.blend("network.Post", owner=followed_user)
        request = RequestFactory().get("/")
        request.user = user
        response = views.FollowingView.as_view()(request)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.context_data["object_list"]), 3)



class CreateAPIView(TestCase):
    def setUp(self) -> None:
        self.view = views.CreateAPIView.as_view()


    def test_authenticated_user_can_create_post_and_get_redirected_to_index_page(self):
        user = mixer.blend("network.User")
        req = APIRequestFactory().post(
            "/", data={"content": "hello"}, format='json')
        force_authenticate(req, user=user)
        res = self.view(req)
        self.assertEqual(Post.objects.all().count(), 1, "should create post in the database")
        self.assertEqual(res.status_code, 302)
        self.assertEqual(res.url, reverse("index"), "url should match the index page")

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
        self.assertEqual(res.status_code, 204,
                         "post should be able to be deleted")


class TestPostLikesAPIView(TestCase):
    def setUp(self):
        self.view = views.PostLikesAPIView.as_view()
        self.user: User = mixer.blend("network.User")

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
        self.assertTrue(response.data["is_liked"])

    def test_can_unlike_post(self):
        post = mixer.blend("network.Post", pk=1)
        self.user.like(post)
        self.assertTrue(self.user.has_liked(post))
        response = self.view(self.authenticated_delete_request, pk=1)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(response.data["is_liked"])


class TestPostFollowedAPIView(TestCase):

    def setUp(self):
        self.view = views.PostFollowedAPIView.as_view()
        self.user: User = mixer.blend("network.User")
        self.authenticated_get_request = APIRequestFactory().get("/")
        force_authenticate(self.authenticated_get_request, user=self.user)

    def test_endpoint_requires_authentication(self):
        unauthenticated_request = APIRequestFactory().get("/")
        response = self.view(unauthenticated_request)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_posts_are_from_followed_users(self):
        followed_user1 = mixer.blend("network.User")
        followed_user2 = mixer.blend("network.User")
        self.user.following_set.add(followed_user1, followed_user2)
        for _ in range(14):
            mixer.blend("network.Post", owner=followed_user1)
            mixer.blend("network.Post", owner=followed_user2)
            mixer.blend("network.Post")
        response = self.view(self.authenticated_get_request)
        results = response.data["results"]
        for result in results:
            self.assertIn(result["owner"], [
                          followed_user1.username, followed_user2.username],
                          "all posts returned are from followed users")


class TestUserFollowAPIView(TestCase):
    def setUp(self):
        self.view = views.UserFollowAPIView.as_view()
        self.user: User = mixer.blend("network.User", id=43)

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

    def test_endpoint_returns_404_when_user_does_not_exist(self):
        response = self.view(self.authenticated_post_request, pk=1)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

        response = self.view(self.authenticated_delete_request, pk=1)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_can_follow_user(self):
        user_to_follow = mixer.blend("network.User", pk=1)
        response = self.view(self.authenticated_post_request, pk=1)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(self.user.has_followed(user_to_follow))
        self.assertTrue(response.data["is_followed"])

    def test_can_unfollow_user(self):
        user_to_unfollow = mixer.blend("network.User", pk=1)
        self.user.follow(user_to_unfollow)
        self.assertTrue(self.user.has_followed(user_to_unfollow))
        response = self.view(self.authenticated_delete_request, pk=1)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(self.user.has_followed(user_to_unfollow))
        self.assertFalse(response.data["is_followed"])

    def test_cannot_follow_self(self):
        response = self.view(self.authenticated_post_request, pk=43)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(self.user.has_followed(self.user))