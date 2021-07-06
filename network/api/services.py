from typing import List
from network.models import Post

def paginated_posts(offset: int, request):
    paginated_posts = Post.objects.all()
    count = len(paginated_posts)
    paginated_posts = paginated_posts[offset * 10 - 1:10]
    previous = offset - 1 if offset > 1 else 0
    return {
     "count": count,
     "next": offset + 1,
     "previous": previous,
     "results": [post.serialize(request) for post in paginated_posts]
   }