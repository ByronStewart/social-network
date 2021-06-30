type PostDTO = {
  id: number,
  creator: string,
  creator_id: number,
  content: string,
  created_at: string
}

var posts: PostDTO[] = []

function createPostElement(post: PostDTO): HTMLDivElement {
  const wrapper = document.createElement("div")
  wrapper.classList.add("mb-3", "row", "p-5", "bg-dark", "text-white")

  const creatorH5 = document.createElement("h5")
  const creatorProfileLink = document.createElement("a")
  creatorProfileLink.href = `/user/${post.creator_id}`
  creatorProfileLink.textContent = post.creator
  creatorH5.appendChild(creatorProfileLink)
  wrapper.appendChild(creatorH5)

  const contentP = document.createElement("p")
  contentP.textContent  = post.content
  wrapper.appendChild(contentP)
  return wrapper
}