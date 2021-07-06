console.log('hello from profile')

const followBtn = document.querySelector("#follow-btn")
const followerCount = document.querySelector("#follower-count")

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
  if (response.ok) {
    followBtn.textContent = status ? "Follow" : "Unfollow"
    followBtn.setAttribute("data-follow-status", !status ? "true" : "false")
    
    const followerCountElt = <HTMLSpanElement>document.querySelector("#follower-count")!
    followerCountElt.textContent = data.follower_count
  }
  console.log(data)
})

var nextPageButton = <HTMLButtonElement>document.querySelector("#next-page-btn")
var prevPageButton = <HTMLButtonElement>document.querySelector("#prev-page-btn")

nextPageButton?.addEventListener("click", () => {
  ++offset
  getAllUserPosts(offset)
})

prevPageButton?.addEventListener("click", () => {
  offset = offset < 1 ? 0 : --offset
  getAllUserPosts(offset)
})

async function getAllUserPosts(offset: number) {
  console.log("fetching posts")
  const url = window.location.href
  // get the user id from the url
  const userId = url.split("/").slice(-1).pop()
  const response = await fetch(`/api/posts/${userId}?offset=${offset}`)
  posts = <PaginatedPosts>await response.json()
  const postContainer = document.querySelector<HTMLDivElement>("#post-list")!
  renderPosts(postContainer, posts.results)
}


getAllUserPosts(offset)