from django.urls import path

from . import views

app_name = "api"
urlpatterns = [
    path("posts", views.allPosts, name="all-posts"),
    path("user/follow", views.toggleFollow, name="toggle-follow"),
    path("posts/<int:user_id>", views.postsByUser, name="user-posts"),
    path("posts/following", views.postsFollowing, name="user-posts"),
    path("posts/new", views.createPost, name="create-post"),
    path("posts/like/<int:pk>", views.likePost, name="like-post"),
    path("posts/edit/<int:pk>", views.editPost, name="edit-post"),
    path("posts/delete/<int:pk>", views.deletePost, name="delete-post"),
]