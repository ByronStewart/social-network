
from django.urls import path

from . import views

urlpatterns = [
    path("", views.AllPostsView.as_view(), name="index"),
    path("/user/<int:pk>", views.AllUserPostsView.as_view(), name="user=posts"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),
    path("api/posts", views.CreatePostView.as_view(), name="create-post")
]
