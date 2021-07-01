console.log('hello from profile')

const followBtn = document.querySelector("#follow-btn")

followBtn?.addEventListener("click", async e => {
  const status = followBtn.getAttribute("data-follow-status") == "true" ? true : false
  const profileId = window.location.href.split("/").slice(-1).pop()
  
  const response = await fetch("../api/user/follow", {
    method: "POST",
    body: JSON.stringify({
      profileId,
      wantsToFollow : status ? false : true
    })
  })
  const data = await response.json()
  console.log(data)
})

async function getAllUserPosts() {
  console.log("fetching posts")
  const url = window.location.href
  // get the user id from the url
  const userId = url.split("/").slice(-1).pop()
  const response = await fetch(`/api/posts/${userId}`)
  posts = <PostDTO[]>await response.json()
  const postContainer = document.querySelector<HTMLDivElement>("#post-list")!
  postContainer.innerHTML = ""
  for (const post of posts) {
    postContainer.appendChild(createPostElement(post))  
  }
}



getAllUserPosts()