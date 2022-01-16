from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render
from django.urls import reverse
from django.views.generic import TemplateView, View
from django.http import JsonResponse


from .models import User


class IndexView(TemplateView):
    template_name = "network/index.html"


class ProfileView(TemplateView):
    template_name = "network/profile.html"


class FollowingView(TemplateView):
    template_name = "network/following.html"

# class PostListCreateAPIView(View):
#     def get(self, req, *args, **kwargs):
#         """ will get a list of all the posts """
#         return JsonResponse({"message": "hi"})

#     def post(self, req, *args, **kwargs):
#         """ will create a post to save to the database """
#         return JsonResponse({"message": "hi"})


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
