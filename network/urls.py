
from django.urls import path

from . import views

urlpatterns = [
    path("", views.IndexView.as_view(), name="index"),
    path("api/posts", views.CreateAPIView.as_view(), name="posts"),
    path("api/posts/<int:pk>", views.PostRetrieveUpdateDestroyAPIView.as_view(), name="post"),
    path("api/posts/<int:pk>/like", views.PostLikesAPIView.as_view(), name="like-post"),
    path("api/posts/followed", views.PostFollowedAPIView.as_view(), name="following"),
    path("api/users/<int:pk>/follow", views.UserFollowAPIView.as_view(), name="follow-user"),
    path("users/<int:pk>/profile", views.ProfileDetailView.as_view(), name="profile"),
    path("users/following", views.FollowingView.as_view(), name="following"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register")
]
