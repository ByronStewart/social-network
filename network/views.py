from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.mixins import LoginRequiredMixin
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render
from django.urls import reverse
from django.views import generic

from .models import Post, User


class AllPostsView(generic.ListView):
    model = Post
    def get_queryset(self):
        return Post.objects.all().order_by("-created_at")

    template_name = "network/index.html"


class AllUserPostsView(generic.ListView):
    model = Post
    def get_queryset(self):
        user_id = self.kwargs.get("pk")
        return Post.objects.filter(creator_id=user_id)

    template_name = "network/index.html"


class CreatePostView(LoginRequiredMixin , generic.CreateView):
    model = Post
    fields = ['content']
    success_url = "/"

    def form_valid(self, form) -> HttpResponse:
        form.instance.creator = self.request.user
        return super().form_valid(form)


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
