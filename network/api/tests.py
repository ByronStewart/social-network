from network.models import Post, User
from django.test import TestCase
from django.urls import reverse

class TestApi(TestCase):
    def test_loads(self):
        assert True == True

""" class NotTestLikePostEndpoint(TestCase):
    
    def setUp(self):
        self.user = User(username="Alice")
        self.user.set_password("password")
        self.user.save()
        self.url = reverse("like-post", args=("1",))
    
    def test_responds_with_403_when_not_logged_in(self):
        res = self.client.post(self.url)
        self.assertEqual(res.status_code, 403)

    def test_responds_with_201_when_logged_in(self):
        self.client.login(username="Alice", password="password")
        res = self.client.post(self.url)
        self.assertEqual(res.status_code, 201)
 """


class TestPostsListCreateApiView(TestCase):

    def setUp(self):
        self.mock_data()
    
    def mock_data(self):
        user1 = User(username="fred")
        user2 = User(username="bob")
        post1 = Post(creator=user1, content="user1 first post")
        post2 = Post(creator=user2, content="user2 first post")
        user1.save()
        user2.save()
        post1.save()
        post2.save()

    def test_get_returns_list_of_posts(self):
        response = self.client.get("/api/posts")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertJSONEqual()

    