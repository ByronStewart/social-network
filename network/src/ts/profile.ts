console.log('hello from profile')



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