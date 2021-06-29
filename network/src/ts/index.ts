import { PostDTO } from "./dto"

async function getAllPosts() {
  console.log("fetching posts")
  const response = await fetch("/api/posts")
  const posts = <PostDTO[]>await response.json()
  console.log(posts)
  const postContainer = document.querySelector<HTMLDivElement>("#post-list")!
  for (const post of posts) {
    postContainer.appendChild(createPostElement(post))  
  }

}
function createPostElement(post: PostDTO): HTMLDivElement {
  const wrapper = document.createElement("div")
  wrapper.classList.add("mb-3", "row", "p-5", "bg-dark", "text-white")

  const creatorH5 = document.createElement("h5")
  creatorH5.textContent = post.creator
  wrapper.appendChild(creatorH5)

  const contentP = document.createElement("p")
  contentP.textContent  = post.content
  wrapper.appendChild(contentP)

  return wrapper
}



console.log('hello world')
getAllPosts()