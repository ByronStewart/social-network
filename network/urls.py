
from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("user/<int:pk>", views.profile, name="profile"),
    path("following", views.following, name="following"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),
    path("api/posts", views.allPosts, name="all-posts"),
    path("api/user/follow", views.toggleFollow, name="toggle-follow"),
    path("api/posts/<int:user_id>", views.postsByUser, name="user-posts"),
    path("api/posts/following", views.postsFollowing, name="user-posts"),
    path("api/posts/new", views.createPost, name="create-post"),
    path("api/posts/like/<int:pk>", views.likePost, name="like-post"),
    path("api/posts/edit/<int:pk>", views.editPost, name="edit-post"),
    path("api/posts/delete/<int:pk>", views.deletePost, name="delete-post"),
]
