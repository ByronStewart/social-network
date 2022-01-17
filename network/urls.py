
from django.urls import path

from . import views

urlpatterns = [
    path("", views.IndexView.as_view(), name="index"),
    path("api/posts", views.PostListCreateAPIView.as_view(), name="posts"),
    path("api/posts/<int:pk>", views.PostRetrieveUpdateDestroyAPIView.as_view(), name="post"),
    path("user/profile", views.ProfileView.as_view(), name="profile"),
    path("user/following", views.FollowingView.as_view(), name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register")
]
