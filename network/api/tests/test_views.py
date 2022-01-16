from django.test import TestCase
from django.test.client import RequestFactory

from network.models import Post, User
from .. import views

class TestPostsListCreateApiView(TestCase):
    def setUp(self):
        self.mock_data()
    
    def mock_data(self):
        data = [
            {
                "user": "fred",
                "content": "user1 first post"
            },
            {
                "user": "bob",
                "content": "user2 first post"
            }
        ]
        for x in data:
            user = User(username=x["user"])
            post = Post(creator=user, content=x["content"])
            user.save()
            post.save()

    def test_get_returns_list_of_posts(self):
        response = self.client.get("/api/posts")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIsNotNone(data["results"])
        self.assertEqual(len(data["results"]), 2)

    def test_does_not_require_authentication(self):
        req = RequestFactory()
        res = views.PostsListCreateApiView.as_view()(req)
        self.assertEqual(res.status_code, 210, "All users should be able to access the endpoint")