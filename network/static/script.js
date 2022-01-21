/**
 * Like post entry point
 */
document.querySelectorAll('[id*="like-post"]').forEach((elt) => {
  elt.addEventListener("click", async function () {
    const id = this.getAttribute("data-postid");
    const isLiked =
      this.getAttribute("data-likedStatus") == "true" ? true : false;
    const post = await likePost(id, isLiked);

    // if the request returns an error do not change anything
    if (!post) return;
    this.setAttribute("data-likedStatus", post.is_liked);

    // style the element based on is_liked
    this.innerText = post.is_liked ? "unlike" : "like";

    // update the like count
    document.getElementById(`post-${id}-like-count`).innerText =
      post.like_count;
  });
});

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
        "X-CSRFToken": getCookie("csrftoken"),
      },
    });
    const post = await response.json();
    return post;
  } catch (error) {
    console.error(error);
    return null;
  }
}


/**
 * Follow user button click entrypoint
 */
document.querySelector('#follow-user').addEventListener("click", async function() {
  const id = this.getAttribute("data-userid")
  const isFollowed = this.getAttribute("data-followed-status") == "true" ? true : false
  const user = await followUser(id, isFollowed)

  // if the request returns an error do nothing
  if(!user) return
  this.setAttribute("data-followed-status", user.is_followed)

  // style the element based on is_followed
  this.innerText = user.is_followed ? "Unfollow" : "Follow"

  // update the follower count
  document.getElementById("follower-count").innerText = user.follower_count
})


/**
 * Toggles the following of users
 * @param {string} id - the Id of the post
 * @param {boolean} isFollowed - the current status of the post
 */
 async function followUser(id, isFollowed) {
  try {
    const response = await fetch(`/api/users/${id}/follow`, {
      method: isFollowed ? "DELETE" : "POST",
      headers: {
        "X-CSRFToken": getCookie("csrftoken"),
      },
    });
    const user = await response.json();
    return user;
  } catch (error) {
    console.error(error);
    return null;
  }
}


/**
 * Edit post entry point
 */
document.querySelectorAll('[id*="post-edit-button"]').forEach(elt => {
  elt.addEventListener("click", async function () {
    const id = this.getAttribute("data-postId")
    const contentWrapper = document.getElementById(`post-content-wrapper-${id}`)
    // clear the content element to add the edit form
    contentWrapper.innerHTML = ""

    // add the edit form
    const textArea = document.createElement("textarea")
    
    contentWrapper.appendChild
  })
})




/**
 * helper function to get the cookie value of a given name
 * @param {string} name - The name of the cookie 
 */
function getCookie(name) {
  let cookieValue = null;
  if (document.cookie && document.cookie !== "") {
    const cookies = document.cookie.split(";");
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.substring(0, name.length + 1) === name + "=") {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}
