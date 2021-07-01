import json
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.mixins import LoginRequiredMixin
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect
from django.http.response import JsonResponse
from django.shortcuts import get_object_or_404, render
from django.urls import reverse
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt


from .models import Post, User


def index(request):
    """ 
        Will return a page with a form to create a new post
    """
    return render(request, "network/index.html")

# TODO pagination


def allPosts(request):
    posts = Post.objects.all()
    posts = posts.order_by("-created_at").all()
    return JsonResponse([post.serialize() for post in posts], safe=False)

# TODO pagination


def postsByUser(request, user_id):
    posts = Post.objects.filter(creator=user_id)
    posts = posts.order_by("-created_at").all()
    return JsonResponse([post.serialize() for post in posts], safe=False)


@login_required
def postsFollowing(request):
    users_following = request.user.following_set.all()
    posts = Post.objects.filter(creator__in=users_following)
    posts = posts.order_by("-created_at").all()
    return JsonResponse([post.serialize() for post in posts], safe=False)


@csrf_exempt
@login_required
def toggleFollow(request):
    if request.method != "POST":
        return JsonResponse({"error": "must be a post request"}, status=400)

    data = json.loads(request.body)
    wantsToFollow = data["wantsToFollow"]
    userToFollowId = data["profileId"]

    if type(wantsToFollow) != bool:
        return JsonResponse({"error": "post must contain a parameter wantsToFollow"}, status=400)
    else:
        userToFollow = User.objects.get(pk=userToFollowId)
        if wantsToFollow:
            request.user.following_set.add(userToFollow)
        else:
            request.user.following_set.remove(userToFollow)

        return JsonResponse({"message": "success", "follower_count": userToFollow.followed_by_set.count()})

# TODO

@csrf_exempt
@login_required
def editPost(request, pk):
    if request.method != "POST":
        return JsonResponse({"error": "must be a post request"}, status=400)

    data = json.loads(request.body)    
    content = data["content"]

    if content == None or content.strip() == "":
        return JsonResponse({"error": "post must contain a body"}, status=400)

    postToEdit = Post.objects.get(pk=pk)
    if postToEdit.creator != request.user:
        return JsonResponse({"error": "Post must be edited by the user who posted it"}, status=400)
    
    postToEdit.content = content
    postToEdit.save()

    return JsonResponse({"message": "success", "content": content})

# TODO


@csrf_exempt
@login_required
def createPost(request):

    # Creating a new post must be via POST
    if request.method != "POST":
        return JsonResponse({"error": "POST request required."}, status=400)

    data = json.loads(request.body)
    content = data["content"]

    if content == None or content.strip() == "":
        return JsonResponse({"error": "post must contain a body"}, status=400)

    # save the new post in the database
    post = Post(creator=request.user, content=content)
    post.save()

    # TODO make a better response
    return JsonResponse({"message": "thankyou"})

# TODO


def deletePost(request, pk):
    return JsonResponse()


def profile(request, pk):
    """ 
        Will return the profile information for the pk of the user
    """
    profile = get_object_or_404(User, pk=pk)
    isFollowed = request.user.following_set.filter(pk=pk)
    isFollowed = isFollowed.exists()
    numberOfPeopleFollowing = profile.following_set.count()
    numberOfFollowers = profile.followed_by_set.count()
    return render(request, "network/profile.html", {
        "profile": profile,
        "is_followed": isFollowed,
        "number_of_people_following": numberOfPeopleFollowing,
        "number_of_followers": numberOfFollowers
    })

# TODO


@login_required
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
