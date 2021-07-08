from django.db.models.manager import BaseManager
from django.http.request import HttpRequest


def paginated_posts(posts: BaseManager, offset: int, request: HttpRequest):
    count = len(posts)
    end = offset * 10 + 10
    beginning = offset * 10
    previous = offset - 1
    next = offset + 1

    if beginning > 0 and end < len(posts) :      
        # normal
        pass
    elif beginning < 1:
        # start
        previous = 0
        next = 1
        beginning = 0
        end = beginning + 10
    elif end >= len(posts):
        # end
        next = offset
        previous = offset - 1    
    
    posts = posts[beginning: end]
    return {
        "count": count,
        "next": next,
        "previous": previous,
        "results": [post.serialize(request) for post in posts]
    }
