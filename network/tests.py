from django.urls.base import reverse
from network.models import User
from network.views import index
from django.test import TestCase

# Create your tests here.


class TestProfileView(TestCase):

    def setUp(self):
        self.current_user = User(username="Bob")
        self.current_user.set_password("password")
        self.current_user.save()
        self.other_user = User(username="Jane")
        self.other_user.save()
        self.current_user_profile_url = reverse("profile", args=(self.current_user.pk,))
        self.other_user_profile_url = reverse("profile", args=(self.other_user.pk,))

    def test_page_uses_correct_template(self):
        res = self.client.get(self.current_user_profile_url)
        self.assertTemplateUsed(res, "network/profile.html")

    def test_responds_with_200(self):
        res = self.client.get(self.current_user_profile_url)
        self.assertEqual(res.status_code, 200)
        res = self.client.get(self.other_user_profile_url)
        self.assertEqual(res.status_code, 200, "200 status when logged in")
        self.client.login(username="Bob", password="password")
        
    def test__profile_of_self(self):
        self.client.login(username="Bob", password="password")
        res = self.client.get(self.current_user_profile_url)
        self.assertEqual(res.context["profile"], self.current_user)
        self.assertFalse(res.context["is_followed"])

    def test_profile_page_not_authenticated(self):
        res = self.client.get(self.current_user_profile_url)
        self.assertIsInstance(res.context["profile"], User)
        self.assertIsNone(res.context["is_followed"])

    def test_profile_of_other_user_not_followed(self):
        self.client.login(username="Bob", password="password")
        url = reverse("profile", args=(self.other_user.pk,))
        res = self.client.get(url)
        self.assertEqual(res.context["profile"], self.other_user)
        self.assertFalse(res.context["is_followed"])

    def test_profile_of_followed_user_context(self):
        self.client.login(username="Bob", password="password")
        url = reverse("profile", args=(self.other_user.pk,))
        self.current_user.following_set.add(self.other_user)
        self.other_user.save()
        res = self.client.get(url)
        self.assertTrue(res.context["is_followed"])


class TestIndexView(TestCase):
    index_url = "/"

    def test_index_page(self):
        res = self.client.get(self.index_url)
        self.assertEqual(res.status_code, 200)
        self.assertTemplateUsed("network/index.html")


class TestFollowingView(TestCase):
    following_url = reverse("following")

    def setUp(self) -> None:
        self.current_user = User(username="Bob")
        self.current_user.set_password("password")
        self.current_user.save()

    def test_following_page_requires_login(self):
        res = self.client.get(self.following_url)
        self.assertEqual(res.status_code, 302)

    def test_following_page_after_logging_in_returns_200(self):
        self.client.login(username="Bob", password="password")
        res = self.client.get(self.following_url)
        self.assertEqual(res.status_code, 200)

    def test_following_page_loads_template(self):
        self.client.login(username="Bob", password="password")
        res = self.client.get(self.following_url)
        self.assertTemplateUsed(res, "network/following.html")