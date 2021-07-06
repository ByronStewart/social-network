
# TODO pagination

import json
from network.api.services import paginated_posts
from network.models import Post, User
from django.contrib.auth.decorators import login_required
from django.http.response import JsonResponse
from django.http import HttpRequest
from django.shortcuts import get_object_or_404
from django.views.decorators.csrf import csrf_exempt


@csrf_exempt
@login_required
def likePost(request: HttpRequest, pk):
    if request.method != "POST":
        return JsonResponse({"error": "must be a post request"}, status=400)

    data = json.loads(request.body)
    toLike = data["toLike"]

    if type(toLike) != bool:
        return JsonResponse({"error": "post must contain a parameter wantsToFollow"}, status=400)

    post = get_object_or_404(Post, pk=pk)

    if toLike:
        post.liked_by_set.add(request.user)
    else:
        post.liked_by_set.remove(request.user)

    return JsonResponse(post.serialize(request))


def allPosts(request: HttpRequest):
    posts = Post.objects.all()
    try:
        offset = request.GET['offset']
        return JsonResponse(paginated_posts(posts, int(offset), request))
    except KeyError:
        return JsonResponse(paginated_posts(posts, 0 ,request))


def postsByUser(request: HttpRequest, user_id):
    posts = Post.objects.filter(creator=user_id)
    try:
        offset = request.GET['offset']
        return JsonResponse(paginated_posts(posts, int(offset), request))
    except KeyError:
        return JsonResponse(paginated_posts(posts, 0 ,request))


@login_required
def postsFollowing(request: HttpRequest):
    users_following = request.user.following_set.all()
    posts = Post.objects.filter(creator__in=users_following)
    try:
        offset = request.GET['offset']
        return JsonResponse(paginated_posts(posts, int(offset), request))
    except KeyError:
        return JsonResponse(paginated_posts(posts, 0 ,request))


@csrf_exempt
@login_required
def toggleFollow(request: HttpRequest):
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


@csrf_exempt
@login_required
def editPost(request: HttpRequest, pk):
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

    return JsonResponse({"message": "success", "post": postToEdit.serialize(request)})


@csrf_exempt
@login_required
def createPost(request: HttpRequest):

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


def deletePost(request: HttpRequest, pk):
    return JsonResponse()
