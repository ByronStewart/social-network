/**
 * New post form submission
 */
document.getElementById("new-post-form")?.addEventListener("submit", async function(e) {
  const textArea = document.getElementById("content")
  const content = textArea.value
  if (content.trim() == "") {
    e.preventDefault()
    showModal("content must have at least one character")
    return
  }
})

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
    this.innerText = post.is_liked ? "❤" : "🤍";

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
const followUserButton = document.querySelector("#follow-user");
if (followUserButton) {
  followUserButton.addEventListener("click", async function () {
    const id = this.getAttribute("data-userid");
    const isFollowed =
      this.getAttribute("data-followed-status") == "true" ? true : false;
    const user = await followUser(id, isFollowed);

    // if the request returns an error do nothing
    if (!user) return;
    this.setAttribute("data-followed-status", user.is_followed);

    // style the element based on is_followed
    this.innerText = user.is_followed ? "Unfollow" : "Follow";

    // update the follower count
    document.getElementById("follower-count").innerText = user.follower_count;
  });
}

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
 * Show the modal
 * @param {string} message - the message to send
 */
function showModal(message) {
  document.getElementById("modal-message").innerText = message
  const modal = document.getElementById("modal")
  modal.classList.remove("hidden")
  modal.classList.add("fixed")
  document.getElementById("close-modal-button").focus()
}
/**
 * Event listener to close the modal
 */
document.getElementById("modal")?.addEventListener("click", closeModal)
document.getElementById("modal-button")?.addEventListener("click", closeModal)

/**
 * Close the modal
 * @param {Event} event
 */
function closeModal(event) {
  event.stopPropagation()
  const modal = document.getElementById("modal")
  modal.classList.remove("fixed")
  modal.classList.add("hidden")
}

/**
 * Toggle editing of post entry point
 */
document.querySelectorAll('[id*="post-edit-button"]').forEach(btn => {
  btn.addEventListener("click", function () {
    const id = this.getAttribute("data-postId")
    makeEditAreaVisible(id)
    // focus the textarea
    const textArea = document.getElementById(`content-${id}`)
    textArea.focus()
    textArea.setSelectionRange(textArea.value.length, textArea.value.length)
  })
})

/**
 * Cancel the form submission entry point
 */
document.querySelectorAll('[id*="cancel-edit"]').forEach(btn => {
  btn.addEventListener("click", function () {
    // reset the text area value to the post content
    const id = this.getAttribute("data-postId")
    const content = document.getElementById(`post-${id}-content`).innerText
    const textArea = document.getElementById(`content-${id}`)
    textArea.value = content
    makeEditAreaVisible(null)    
  })
})


/**
 * Edit post form submission entry point
 */
document.querySelectorAll('[id*="edit-post-form"]').forEach((form) => {
  form.addEventListener("submit", async function(e) {
    e.preventDefault()
    const id = this.getAttribute("data-postId")
    const textArea = document.getElementById(`content-${id}`)
    content = textArea.value
    // check that the textarea contents are valid
    if (content.trim() == "") {
      showModal("content must have at least one character")
      return
    }
    const post = await updatePost(id, content)
    if (!post) return
    const postContentElt = document.getElementById(`post-${id}-content`)
    postContentElt.innerText = post.content
    textArea.innerText = post.content

    //TODO change the last updated date - requires backend changes too
    makeEditAreaVisible(null)
  })
});

/**
 * Helper function to make the editable area viewable on a single element
 * @param {id} - the id of the post, can also be null to close all edit areas
 */
function makeEditAreaVisible(id=null) {
  document.querySelectorAll('[id*="post-edit-wrapper"]').forEach(elt => {
    // make editable area visible the post with id passed

    if (elt.id == `post-edit-wrapper-${id}`) {
      elt.classList.remove("hidden")
    } else { // make all other hidden
      elt.classList.add("hidden")
    }
  })
  document.querySelectorAll('[id*="post-content-wrapper"]').forEach(elt => {
    // make post content hidden for the post with id passed
    if (elt.id == `post-content-wrapper-${id}`) {
      elt.classList.add("hidden")
    } else { // make all others visible
      elt.classList.remove("hidden")
    }
  })
}


 /**
  * Will send request to update a post's content
  * @param id {(string|number)} - The post's ID
  * @param content {string} - The post's content 
  * @returns {(object|null)} - the post or null if error
  */
async function updatePost(id, content) {
  try {
    const response = await fetch(`/api/posts/${id}`, {
      method: "PUT",
      headers: {
        "X-CSRFToken": getCookie("csrftoken"),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ content }),
    });
    const post = await response.json();
    return post;
  } catch (error) {
    console.error(error);
    return null;
  }
}

/**
 * Delete post entry point
 */
document.querySelectorAll('[id*="post-delete-button"]').forEach(btn => {
  btn.addEventListener("click", async function() {
    const id = this.getAttribute("data-postId")
    const isDeleted = await deletePost(id)
    if (isDeleted) return location.reload()
  })
})


/**
 * Will send request to delete post - will return true if successful ; else false
 */
async function deletePost(id) {
  try {
    await fetch(`/api/posts/${id}`,  {
      method: "DELETE",
      headers: {
        "X-CSRFToken": getCookie("csrftoken"),
      }
    })
    return true
  } catch (error) {
    console.error(error)
    return false
  }
}

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
