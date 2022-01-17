from django.test import TestCase
from mixer.backend.django import mixer
from rest_framework.test import APIRequestFactory, force_authenticate
from django.test import RequestFactory
from ..permissions import IsOwnerOrReadOnly

class TestIsOwnerOrReadOnly(TestCase):
    def setUp(self) -> None:
        self.permission = IsOwnerOrReadOnly().has_object_permission
        self.userOwner = mixer.blend("network.User")
        self.obj = mixer.blend("network.Post", owner=self.userOwner)

    def test_will_allow_get_request(self):
        req = RequestFactory().get("/")
        self.assertTrue(self.permission(req, None, self.obj))

    def test_will_not_allow_post_request(self):
        req = RequestFactory().post("/")
        req.user = mixer.blend("network.User")
        self.assertFalse(self.permission(req, None, self.obj))

    def test_will_not_allow_delete_request(self):
        req = RequestFactory().delete("/")
        req.user = mixer.blend("network.User")
        self.assertFalse(self.permission(req, None, self.obj))

    def test_will_not_allow_patch_request(self):
        req = RequestFactory().patch("/")
        req.user = mixer.blend("network.User")
        self.assertFalse(self.permission(req, None, self.obj))

    def test_will_not_allow_put_request(self):
        req = RequestFactory().put("/")
        req.user = mixer.blend("network.User")
        self.assertFalse(self.permission(req, None, self.obj))