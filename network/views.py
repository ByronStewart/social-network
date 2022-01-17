from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render
from django.urls import reverse
from django.views.generic import TemplateView
from .models import User, Post
from .serializers import UserSerializer, PostSerializer
from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView, ListAPIView
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticatedOrReadOnly, IsAuthenticated
from rest_framework.exceptions import NotFound
from rest_framework.response import Response
from rest_framework import status
from .permissions import IsOwnerOrReadOnly


class IndexView(TemplateView):
    template_name = "network/index.html"


class ProfileView(TemplateView):
    template_name = "network/profile.html"


class FollowingView(TemplateView):
    template_name = "network/following.html"


class PostListCreateAPIView(ListCreateAPIView):
    queryset = Post.objects.all()
    serializer_class = PostSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def perform_create(self, serializer: PostSerializer):
        serializer.save(owner=self.request.user)

    def get_queryset(self):
        queried_user = self.request.query_params.get("user", None)
        if queried_user is not None:
            return Post.objects.filter(owner__id=queried_user)
        return super().get_queryset()


class PostRetrieveUpdateDestroyAPIView(RetrieveUpdateDestroyAPIView):
    queryset = Post.objects.all()
    serializer_class = PostSerializer
    permission_classes = [IsOwnerOrReadOnly]


class PostFollowedAPIView(ListAPIView):
    permission_classes = (IsAuthenticated,)
    serializer_class = PostSerializer
    queryset = Post.objects.all()

    def get_queryset(self):
        return Post.objects.filter(
            owner__in=self.request.user.following_set.all()
        )


class UserFollowAPIView(APIView):
    serializer_class = UserSerializer
    permission_classes = (IsAuthenticated,)

    def post(self, _, pk=None):
        try:
            user_to_follow = User.objects.get(pk=pk)
        except User.DoesNotExist:
            raise NotFound('User not found')

        self.request.user.follow(user_to_follow)
        serializer = self.serializer_class(user_to_follow)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def delete(self, _, pk=None):
        try:
            user_to_unfollow = User.objects.get(pk=pk)
        except User.DoesNotExist:
            raise NotFound("User not found")

        self.request.user.unfollow(user_to_unfollow)
        serializer = self.serializer_class(user_to_unfollow)
        return Response(serializer.data, status=status.HTTP_200_OK)


class PostLikesAPIView(APIView):
    serializer_class = PostSerializer
    permission_classes = (IsAuthenticated,)

    def post(self, _, pk=None):
        user: User = self.request.user
        try:
            post = Post.objects.get(pk=pk)
        except Post.DoesNotExist:
            raise NotFound('Post not found')

        user.like(post)
        serializer = self.serializer_class(post)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def delete(self, _, pk=None):
        user: User = self.request.user
        try:
            post = Post.objects.get(pk=pk)
        except Post.DoesNotExist:
            raise NotFound('Post not found')

        user.unlike(post)
        serializer = self.serializer_class(post)
        return Response(serializer.data, status=status.HTTP_200_OK)


def login_view(request):
    """ CS50 provided """
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "network/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "network/login.html")


def logout_view(request):
    """ CS50 provided """
    logout(request)
    return HttpResponseRedirect(reverse("index"))


def register(request):
    """ CS50 provided """
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "network/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "network/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "network/register.html")
