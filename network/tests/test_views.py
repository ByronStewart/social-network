from django.test import TestCase, RequestFactory

from .. import views

class TestSanity(TestCase):
    def test_sanity(self):
        self.assertTrue(True)

class TestIndexView(TestCase):
    def test_can_be_viewed_by_all_users(self):
        req = RequestFactory().get("/")
        res = views.IndexView.as_view()(req)
        self.assertEqual(res.status_code, 200, "Should be viewable by all users")

class TestProfileView(TestCase):
    def test_can_be_viewed_by_all_users(self):
        req = RequestFactory().get("/")
        res = views.ProfileView.as_view()(req)
        self.assertEqual(res.status_code, 200, "Should be viewable by all users")

class TestFollowingView(TestCase):
    def test_can_be_viewed_by_all_users(self):
        req = RequestFactory().get("/")
        res = views.FollowingView.as_view()(req)
        self.assertEqual(res.status_code, 200, "Should be viewable by all users")