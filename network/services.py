from django.http.request import HttpRequest
from network.models import User


def get_profile_context(profile: User, request: HttpRequest):
    return {"profile" : profile,
      "is_followed": profile.is_followed_by_user(request),
    }