type PostDTO = {
  id: number;
  creator: string;
  creator_id: number;
  content: string;
  created_at: string;
  likes: number;
  is_liked: boolean | null;
};
type PaginatedPosts = {
  count: number;
  next: number;
  previous: number;
  results: PostDTO[];
};

var posts: PaginatedPosts = {
  count: 0,
  next: 0,
  previous: 0,
  results: [],
};

var userIdDiv = <HTMLDivElement>document.querySelector("#user");
var userId = userIdDiv.textContent ? parseInt(userIdDiv.textContent) : null;

function renderPosts(wrappingElement: HTMLDivElement, posts: PostDTO[]) {
  wrappingElement.innerHTML = "";
  for (let i = 0; i < posts.length; i++) {
    wrappingElement.appendChild(createPostElement(posts[i]));
  }
}

async function toggleLikePost(post: PostDTO): Promise<PostDTO> {
  const response = await fetch(`api/posts/like/${post.id}`, {
    method: "POST",
    body: JSON.stringify({
      toLike: post.is_liked ? false : true,
    }),
  });
  const data = <PostDTO>await response.json();
  console.log(data);
  return data;
}

function createPostElement(post: PostDTO): HTMLDivElement {
  const card = document.createElement("div");
  card.classList.add("card", "border-dark", "mb-3", "max-w-30");
  card.id = `post-${post.id}`;
  const cardBody = createCardBody(post);
  const cardFooter = createCardFooter(post);
  card.appendChild(cardBody);
  card.appendChild(cardFooter);
  return card;
}

function createCardBody(post: PostDTO): HTMLDivElement {
  const cardBody = document.createElement("div");
  cardBody.classList.add("card-body", "text-dark");
  const cardTitle = createCardBodyTitle(post);
  const cardText = createCardBodyText(post);
  cardBody.appendChild(cardTitle);
  cardBody.appendChild(cardText);
  return cardBody;
}

function createCardBodyText(post: PostDTO): HTMLDivElement {
  const cardText = document.createElement("div");
  cardText.classList.add("card-text");
  cardText.id = `post-${post.id}-edit-area`;
  const cardTextContent = createCardTextContent(post);
  cardText.appendChild(cardTextContent);
  return cardText;
}
function createCardTextContent(post: PostDTO): HTMLDivElement {
  const p = document.createElement("p");
  p.textContent = post.content;
  return p;
}

function createCardBodyTitle(post: PostDTO): HTMLHeadingElement {
  const cardTitle = document.createElement("div");
  cardTitle.classList.add("d-flex", "justify-content-between")

  cardTitle.appendChild(createCardBodyTitleText(post))
  if (userOwnsPost(post)) {
    const editBtn = createEditBtn(post);
    cardTitle.appendChild(editBtn);
  }
  return cardTitle;
}

function createCardBodyTitleText(post: PostDTO) : HTMLHeadingElement {
  const cardTitleText = document.createElement("h5")
  const usernameLink = document.createElement("a");
  usernameLink.classList.add("link-dark", "fw-bold");
  usernameLink.href = `/user/${post.creator_id}`;
  usernameLink.textContent = post.creator;
  cardTitleText.appendChild(usernameLink);
  cardTitleText.innerHTML += " wrote";
  return cardTitleText
}

function createEditBtn(post: PostDTO): HTMLButtonElement {
  const editBtn = document.createElement("button");
  editBtn.classList.add("btn", "btn-sm", "btn-outline-warning");
  editBtn.textContent = "Edit";

  editBtn.addEventListener("click", function makePostEditable() {
    console.log(post.id);
    const cardText = document.getElementById(`post-${post.id}-edit-area`)!;
    cardText.innerHTML = "";
    const editArea = createEditArea(post);
    cardText.appendChild(editArea);
  });

  return editBtn;
}

function replaceEditAreaWithPostContent(post: PostDTO) {
  console.log(post);
  const cardText = document.getElementById(`post-${post.id}-edit-area`)!;
  cardText.innerHTML = "";
  cardText.appendChild(createCardTextContent(post));
}

/* TODO */
function userOwnsPost(post: PostDTO): boolean {
  let userId = document.getElementById("user")!.textContent;
  userId = userId ? userId : "";
  if (post.creator_id === parseInt(userId)) return true;
  return false;
}

function createCardFooter(post: PostDTO): HTMLDivElement {
  const cardFooter = document.createElement("div");
  cardFooter.classList.add(
    "card-footer",
    "d-flex",
    "justify-content-between",
    "align-items-center"
  );
  const dateElt = createDateElt(post);
  const likesElt = createLikesElt(post);
  cardFooter.appendChild(dateElt);
  cardFooter.appendChild(likesElt);
  return cardFooter;
}

function createDateElt(post: PostDTO): HTMLDivElement {
  const div = document.createElement("div");
  div.textContent = post.created_at;
  return div;
}

function createLikesElt(post: PostDTO): HTMLDivElement {
  const wrapper = document.createElement("div");
  wrapper.classList.add(
    "d-flex",
    "align-items-center",
    "justify-content-start"
  );
  const likeCount = createLikeCountElt(post);
  wrapper.appendChild(likeCount);
  if (post.is_liked != null) {
    const likeBtn = createLikeBtn(post);
    wrapper.appendChild(likeBtn);
  }
  return wrapper;
}

function createLikeCountElt(post: PostDTO): HTMLDivElement {
  const likeCountDiv = document.createElement("div");
  likeCountDiv.classList.add("mx-2");
  likeCountDiv.innerHTML = "Likes: ";
  const likeCount = document.createElement("span");
  likeCount.id = `likes-${post.id}`;
  likeCount.textContent = post.likes.toString();
  likeCountDiv.appendChild(likeCount);
  return likeCountDiv;
}

function createLikeBtn(post: PostDTO): HTMLButtonElement {
  const likeBtn = document.createElement("button");
  if (post.is_liked) {
    likeBtn.classList.add("btn", "btn-sm", "btn-outline-danger");
    likeBtn.textContent = "Unlike";
  } else {
    likeBtn.classList.add("btn", "btn-sm", "btn-outline-primary");
    likeBtn.textContent = "Like";
  }

  likeBtn.addEventListener("click", async function () {
    const updatedPost = await toggleLikePost(post);
    post = updatedPost;
    const likeElement = <HTMLSpanElement>(
      document.getElementById(`likes-${post.id}`)
    );
    likeElement.textContent = updatedPost.likes.toString();
    if (post.is_liked) {
      this.textContent = "unlike";
      this.classList.remove("btn-outline-primary");
      this.classList.add("btn-outline-danger");
    } else {
      this.textContent = "like";
      this.classList.remove("btn-outline-danger");
      this.classList.add("btn-outline-primary");
    }
  });
  return likeBtn;
}

async function submitUpdatePost(id: number, content: string): Promise<PostDTO> {
  const response = await fetch(`../api/posts/edit/${id}`, {
    method: "POST",
    body: JSON.stringify({
      content,
    }),
  });
  const data = await response.json();
  return data.post;
}

function createEditArea(post: PostDTO) {
  const form = document.createElement("form");
  form.classList.add("mt-3")
  const wrapper = document.createElement("div");
  wrapper.classList.add("input-group");
  const input = document.createElement("input");
  input.type = "text";
  input.id = `post-${post.id}-content`;
  input.classList.add("form-control");
  input.placeholder = post.content;
  const submitBtn = document.createElement("button");
  submitBtn.classList.add("btn", "btn-outline-secondary");
  submitBtn.textContent = "Post";
  wrapper.appendChild(input);
  wrapper.appendChild(submitBtn);
  form.appendChild(wrapper);

  document.addEventListener("keydown", function cancelUpdatePost(e) {
    console.log("pressed key");
    if (e.key === "Escape") {
      replaceEditAreaWithPostContent(post);
      this.removeEventListener("keydown", cancelUpdatePost);
    }
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const contentInput = <HTMLInputElement>(
      document.getElementById(`post-${post.id}-content`)!
    );
    const content = contentInput.value;
    post = await submitUpdatePost(post.id, content);
    replaceEditAreaWithPostContent(post);
  });
  return form;
}
