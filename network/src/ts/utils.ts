type PostDTO = {
  id: number,
  creator: string,
  creator_id: number,
  content: string,
  created_at: string,
  likes: number,
  isLiked: boolean | null
}

let pageNum = 1
var posts: PostDTO[] = []
var userIdDiv = <HTMLDivElement>document.querySelector("#user")
var userId = userIdDiv.textContent ? parseInt(userIdDiv.textContent) : null

function renderPosts(wrappingElement: HTMLDivElement, posts: PostDTO[], page: number) {
  const numOfPosts = posts.length
  const startingPost = page * 10 - 1
  wrappingElement.innerHTML = ""
  for (let i = startingPost; i < startingPost + 10 || i < posts.length; i++) {
    wrappingElement.appendChild(createPostElement(posts[i]))  
  }
}

async function toggleLikePost( post: PostDTO): Promise<PostDTO> {
  const response = await fetch(`api/posts/like/${post.id}`,{
    method : "POST",
    body: JSON.stringify({
      toLike: post.isLiked ? false : true
    })
  })
  const data = <PostDTO> await response.json()
  console.log(data)
  return data
}

function addLikeButton(wrapper: HTMLDivElement, post: PostDTO) {
  const likeButton = document.createElement("button")
  if (typeof(post.isLiked) != "boolean") return
    likeButton.id = `$like-${post.id}`
    likeButton.textContent = post.isLiked ? "Unlike" : "Like"
  
  console.log("adding like button")

  likeButton.addEventListener("click", async function(e) {
    const data = await toggleLikePost(post)
    console.log(data)
    const likeElement = <HTMLSpanElement>document.getElementById(`likes-${post.id}`)
    post.isLiked = !post.isLiked
    likeElement.textContent = data.likes.toString()
    this.textContent = data.isLiked ? "unlike" : "like"
  })

  wrapper.appendChild(likeButton)
}

function fillWrapperWithPost(wrapper: HTMLDivElement, post: PostDTO) {
  wrapper.innerHTML = ""
  const creatorH5 = document.createElement("h5")
  const creatorProfileLink = document.createElement("a")
  creatorProfileLink.href = `/user/${post.creator_id}`
  creatorProfileLink.textContent = post.creator
  creatorH5.appendChild(creatorProfileLink)
  wrapper.appendChild(creatorH5)

  const contentWrapper = document.createElement("div")
  const contentP = document.createElement("p")
  const likeP = document.createElement("p")
  const likeSpan = document.createElement("span")
  likeSpan.id = `likes-${post.id}`
  likeSpan.textContent = post.likes.toString()
  likeP.textContent = "Likes: "
  likeP.appendChild(likeSpan)
  const dateTimeElt = document.createElement("p")
  dateTimeElt.textContent = post.created_at

  contentP.textContent  = post.content
  contentWrapper.appendChild(contentP)
  contentWrapper.appendChild(likeP)
  contentWrapper.appendChild(dateTimeElt)

  const likeWrapper = document.createElement("div")
  addLikeButton(likeWrapper, post)
  wrapper.appendChild(likeWrapper)

  // If post is by the logged in user then make it editable
  if(post.creator_id === userId) {
    const editButton = document.createElement("button")
    editButton.classList.add("btn", "btn-warning", "btn-outline")
    editButton.textContent = "Edit"
    wrapper.appendChild(editButton)
    editButton.addEventListener("click", e => {
      const oldContent = contentWrapper.firstChild?.textContent
      contentWrapper.innerHTML = ""

      const form = document.createElement("form")
      const textArea = document.createElement("input")
      textArea.setAttribute("type", "text")
      textArea.id = post.id.toString()

      const button = document.createElement("button")
      button.setAttribute("type", "submit")
      button.classList.add("btn", "btn-info")
      
      form.appendChild(textArea)
      form.appendChild(button)

      textArea.value = oldContent ? oldContent : ""
      contentWrapper.appendChild(form)

      form.addEventListener("submit",async e => {
        e.preventDefault()
        await editPost(post.id)
      })
      textArea.focus()
    })
  }
  wrapper.appendChild(contentWrapper)
}

function createPostElement(post: PostDTO): HTMLDivElement {
  const wrapper = document.createElement("div")
  wrapper.id = `post-${post.id}`
  wrapper.classList.add("mb-3", "row", "p-5", "bg-dark", "text-white")
  fillWrapperWithPost(wrapper, post)
  
  return wrapper
}

async function editPost(id: number) {
  const contentInput = <HTMLInputElement>document.getElementById(`${id}`)!
  console.log("editing post")
  const response = await fetch(`../api/posts/edit/${id}`, {
    method: "POST",
    body: JSON.stringify({
      content: contentInput.value
    })
  })
  const data = await response.json()
  if (data.message == "success") {
    console.log("success")
    const wrapperElement = <HTMLDivElement>document.getElementById("post-" + data.post.id.toString())!
    console.log(wrapperElement)
    fillWrapperWithPost(wrapperElement, data.post)
  }
  console.log(data)
}