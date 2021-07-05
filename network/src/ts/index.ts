
const createNewPostForm = <HTMLFormElement>document.querySelector("#create-new-post-form")

createNewPostForm?.addEventListener("submit", async e => {
  e.preventDefault()
  const contentElement = <HTMLInputElement>document.querySelector("#post-content")!
  const content = contentElement.value
  contentElement.value = ""
  contentElement.focus()
  console.log("submitting form", content)

  // send the content to the server
  const response = await fetch("api/posts/new", {
    method: "POST",
    body: JSON.stringify({
      content
    })
  })
  const message = await response.json()
  if(response.ok) {
    // reload the posts
    await getAllPosts()
  } else {
    alert(message.error)
  }
})

async function getAllPosts() {
  console.log("fetching posts")
  const response = await fetch("/api/posts")
  posts = <PostDTO[]>await response.json()
  console.log(posts)
  const postContainer = document.querySelector<HTMLDivElement>("#post-list")!
  postContainer.innerHTML = ""
  for (const post of posts) {
    postContainer.appendChild(createPostElement(post))  
  }

}
getAllPosts()