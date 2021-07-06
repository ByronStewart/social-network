
# TODO pagination

import json
from network.models import Post, User
from django.contrib.auth.decorators import login_required
from django.http.response import JsonResponse
from django.shortcuts import get_object_or_404
from django.views.decorators.csrf import csrf_exempt


@csrf_exempt
@login_required
def likePost(request, pk):
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

def allPosts(request):
    posts = Post.objects.all()
    return JsonResponse([post.serialize(request) for post in posts], safe=False)


def postsByUser(request, user_id):
    posts = Post.objects.filter(creator=user_id)
    return JsonResponse([post.serialize(request) for post in posts], safe=False)


@login_required
def postsFollowing(request):
    users_following = request.user.following_set.all()
    posts = Post.objects.filter(creator__in=users_following)
    return JsonResponse([post.serialize(request) for post in posts], safe=False)


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

    return JsonResponse({"message": "success", "post": postToEdit.serialize(request)})


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
