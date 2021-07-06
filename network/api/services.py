from django.db.models.manager import BaseManager
from django.http.request import HttpRequest


def paginated_posts(posts: BaseManager, offset: int, request: HttpRequest):
    count = len(posts)
    beginning = offset * 10
    end = offset * 11
    posts = posts[beginning: end]
    return {
        "count": count,
        "next": offset + 1,
        "previous": offset - 1 if offset > 1 else 0,
        "results": [post.serialize(request) for post in posts]
    }
