
const createNewPostForm = <HTMLFormElement>document.querySelector("#create-new-post-form")
var nextPageButton = <HTMLButtonElement>document.querySelector("#next-page-btn")
var prevPageButton = <HTMLButtonElement>document.querySelector("#prev-page-btn")

nextPageButton?.addEventListener("click", () => {
  getAllPosts(posts.next)
})

prevPageButton?.addEventListener("click", () => {
  getAllPosts(posts.previous)
})

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
    await getAllPosts(0)
  } else {
    alert(message.error)
  }
})

async function getAllPosts(offset: number) {
  console.log("fetching posts")
  const response = await fetch(`/api/posts?offset=${offset}`)
  posts = <PaginatedPosts>await response.json()
  console.log(posts)
  const postContainer = document.querySelector<HTMLDivElement>("#post-list")!
  renderPosts(postContainer, posts.results)

}
getAllPosts(posts.next)