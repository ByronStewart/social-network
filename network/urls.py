
from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("profile/<int:pk>", views.profile, name="profile"),
    path("following/<int:pk>", views.following, name="following"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),
    path("api/posts", views.allPosts, name="all-posts"),
    path("api/posts/new", views.createPost, name="create-post"),
    path("api/posts/edit/<int:pk>", views.editPost, name="edit-post"),
    path("api/posts/delete/<int:pk>", views.deletePost, name="delete-post"),
]
