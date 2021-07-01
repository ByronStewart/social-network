async function getAllFollowingPosts() {
  console.log("fetching posts")
  // get the user id from the url
  const response = await fetch(`/api/posts/following`)
  posts = <PostDTO[]>await response.json()
  const postContainer = document.querySelector<HTMLDivElement>("#post-list")!
  postContainer.innerHTML = ""
  for (const post of posts) {
    postContainer.appendChild(createPostElement(post))  
  }
}


getAllFollowingPosts()