console.log('hello from profile')



async function getAllUserPosts() {
  console.log("fetching posts")
  const response = await fetch("/api/posts")
  posts = <PostDTO[]>await response.json()
  const postContainer = document.querySelector<HTMLDivElement>("#post-list")!
  postContainer.innerHTML = ""
  for (const post of posts) {
    postContainer.appendChild(createPostElement(post))  
  }

}


getAllUserPosts()