var nextPageButton = <HTMLButtonElement>document.querySelector("#next-page-btn")
var prevPageButton = <HTMLButtonElement>document.querySelector("#prev-page-btn")

nextPageButton?.addEventListener("click", () => {
  getAllFollowingPosts(posts.next)
})

prevPageButton?.addEventListener("click", () => {
  getAllFollowingPosts(posts.previous)
})

async function getAllFollowingPosts(offset: number) {
  console.log("fetching posts")
  // get the user id from the url
  const response = await fetch(`/api/posts/following?offset=${offset}`)
  posts = <PaginatedPosts>await response.json()
  const postContainer = document.querySelector<HTMLDivElement>("#post-list")!
  renderPosts(postContainer, posts.results)
}


getAllFollowingPosts(posts.next)