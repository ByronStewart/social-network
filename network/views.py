from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.mixins import LoginRequiredMixin
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect
from django.http.response import JsonResponse
from django.shortcuts import get_object_or_404, render
from django.urls import reverse
from django.views import generic

from .models import Post, User


def index(request):
    """ 
        Will return a page with a form to create a new post
    """
    return render(request, "network/index.html")

# TODO
def allPosts(request):
    posts = Post.objects.all()
    posts.order_by("-created_at")
    return JsonResponse([post.serialize() for post in posts], safe=False)

# TODO
def editPost(request, pk):
    return JsonResponse()
    
# TODO
def createPost(request):
    return JsonResponse()

# TODO
def deletePost(request, pk):
    return JsonResponse()


def profile(request, pk):
    """ 
        Will return the profile information for the pk of the user
    """
    user = get_object_or_404(User, pk=pk)
    # TODO check if the current user has followed the profile

    return render(request, "network/profile.html", {"user": user})

# TODO
def following(request):
    """ Generic page with just filtered posts for the user"""
    return render(request, "network/following.html")

def login_view(request):
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
    logout(request)
    return HttpResponseRedirect(reverse("index"))


def register(request):
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
