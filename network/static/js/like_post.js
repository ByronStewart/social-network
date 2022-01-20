document.querySelectorAll('[id*="like-post"]').forEach(elt => {
  elt.addEventListener("click", async function(){
    const id = this.getAttribute("data-postid")
    const isLiked = this.getAttribute("data-likedStatus") == "true" ? true : false
    const post = await likePost(id, isLiked)

    // if the request returns an error do not change anything
    if (!post) return
    this.setAttribute("data-likedStatus", post.is_liked)

    // style the element based on is_liked
    this.innerText = post.is_liked == true ? "unlike" : "like"

    // update the like count
    document.getElementById(`post-${id}-like-count`).innerText = post.like_count
  })
})

/**
 * Toggles a liking of posts
 * @param {string} id - the Id of the post
 * @param {boolean} isLiked - the current status of the post
 */
async function likePost(id, isLiked) {
  try {
    const response = await fetch(`/api/posts/${id}/like`, {
      method: isLiked ? "DELETE" : "POST",
      headers: {
        "X-CSRFToken": getCookie("csrftoken")
      },
    })
    const post = await response.json()
    return post
  } catch(error) {
    console.error(error)
    return null
  }
}

function getCookie(name) {
  let cookieValue = null;
  if (document.cookie && document.cookie !== '') {
      const cookies = document.cookie.split(';');
      for (let i = 0; i < cookies.length; i++) {
          const cookie = cookies[i].trim();
          if (cookie.substring(0, name.length + 1) === (name + '=')) {
              cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
              break;
          }
      }
  }
  return cookieValue
}