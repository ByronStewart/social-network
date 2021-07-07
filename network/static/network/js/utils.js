"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var offset = 0;
var posts = {
    count: 0,
    next: 1,
    previous: 0,
    results: [],
};
var userIdDiv = document.querySelector("#user");
var userId = userIdDiv.textContent ? parseInt(userIdDiv.textContent) : null;
function renderPosts(wrappingElement, posts) {
    wrappingElement.innerHTML = "";
    for (let i = 0; i < posts.length; i++) {
        wrappingElement.appendChild(createPostElement(posts[i]));
    }
}
function toggleLikePost(post) {
    return __awaiter(this, void 0, void 0, function* () {
        const response = yield fetch(`api/posts/like/${post.id}`, {
            method: "POST",
            body: JSON.stringify({
                toLike: post.is_liked ? false : true,
            }),
        });
        const data = yield response.json();
        console.log(data);
        return data;
    });
}
function fillWrapperWithPost(wrapper, post) {
    wrapper.innerHTML = "";
    const creatorH5 = document.createElement("h5");
    const creatorProfileLink = document.createElement("a");
    creatorProfileLink.href = `/user/${post.creator_id}`;
    creatorProfileLink.textContent = post.creator;
    creatorH5.appendChild(creatorProfileLink);
    wrapper.appendChild(creatorH5);
    const contentWrapper = document.createElement("div");
    const contentP = document.createElement("p");
    const likeP = document.createElement("p");
    const likeSpan = document.createElement("span");
    likeSpan.id = `likes-${post.id}`;
    likeSpan.textContent = post.likes.toString();
    likeP.textContent = "Likes: ";
    likeP.appendChild(likeSpan);
    const dateTimeElt = document.createElement("p");
    dateTimeElt.textContent = post.created_at;
    contentP.textContent = post.content;
    contentWrapper.appendChild(contentP);
    contentWrapper.appendChild(likeP);
    contentWrapper.appendChild(dateTimeElt);
    const likeWrapper = document.createElement("div");
    addLikeButton(likeWrapper, post);
    wrapper.appendChild(likeWrapper);
    // If post is by the logged in user then make it editable
    if (post.creator_id === userId) {
        const editButton = document.createElement("button");
        editButton.classList.add("btn", "btn-warning", "btn-outline");
        editButton.textContent = "Edit";
        wrapper.appendChild(editButton);
        editButton.addEventListener("click", (e) => {
            var _a;
            const oldContent = (_a = contentWrapper.firstChild) === null || _a === void 0 ? void 0 : _a.textContent;
            contentWrapper.innerHTML = "";
            const form = document.createElement("form");
            const textArea = document.createElement("input");
            textArea.setAttribute("type", "text");
            textArea.id = post.id.toString();
            const button = document.createElement("button");
            button.setAttribute("type", "submit");
            button.classList.add("btn", "btn-info");
            form.appendChild(textArea);
            form.appendChild(button);
            textArea.value = oldContent ? oldContent : "";
            contentWrapper.appendChild(form);
            form.addEventListener("submit", (e) => __awaiter(this, void 0, void 0, function* () {
                e.preventDefault();
                yield editPost(post.id);
            }));
            textArea.focus();
        });
    }
    wrapper.appendChild(contentWrapper);
}
function createPostElement(post) {
    const card = document.createElement("div");
    card.classList.add("card", "border-dark", "mb-3", "max-w-30");
    card.id = `post-${post.id}`;
    const cardBody = createCardBody(post);
    const cardFooter = createCardFooter(post);
    //fillWrapperWithPost(card, post)
    card.appendChild(cardBody);
    card.appendChild(cardFooter);
    return card;
}
function createCardBody(post) {
    const cardBody = document.createElement("div");
    cardBody.classList.add("card-body", "text-dark");
    const cardTitle = createCardBodyTitle(post);
    const cardText = createCardBodyText(post);
    cardBody.appendChild(cardTitle);
    cardBody.appendChild(cardText);
    return cardBody;
}
function createCardBodyText(post) {
    const cardText = document.createElement("div");
    cardText.classList.add("card-text");
    cardText.textContent = post.content;
    return cardText;
}
function createCardBodyTitle(post) {
    const cardTitle = document.createElement("h5");
    const usernameLink = document.createElement("a");
    usernameLink.classList.add("link-dark", "fw-bold");
    usernameLink.href = `/user/${post.creator_id}`;
    usernameLink.textContent = post.creator;
    cardTitle.appendChild(usernameLink);
    cardTitle.innerHTML += " wrote";
    return cardTitle;
}
function createCardFooter(post) {
    const cardFooter = document.createElement("div");
    cardFooter.classList.add("card-footer", "d-flex", "justify-content-between", "align-items-center");
    const dateElt = createDateElt(post);
    const likesElt = createLikesElt(post);
    cardFooter.appendChild(dateElt);
    cardFooter.appendChild(likesElt);
    return cardFooter;
}
function createDateElt(post) {
    const div = document.createElement("div");
    div.textContent = post.created_at;
    return div;
}
function createLikesElt(post) {
    const wrapper = document.createElement("div");
    wrapper.classList.add("d-flex", "align-items-center", "justify-content-start");
    const likeCount = createLikeCountElt(post);
    wrapper.appendChild(likeCount);
    if (post.is_liked != null) {
        const likeBtn = createLikeBtn(post);
        wrapper.appendChild(likeBtn);
    }
    return wrapper;
}
function createLikeCountElt(post) {
    const likeCountDiv = document.createElement("div");
    likeCountDiv.classList.add("mx-2");
    likeCountDiv.innerHTML = "Likes: ";
    const likeCount = document.createElement("span");
    likeCount.id = `likes-${post.id}`;
    likeCount.textContent = post.likes.toString();
    likeCountDiv.appendChild(likeCount);
    return likeCountDiv;
}
function createLikeBtn(post) {
    const likeBtn = document.createElement("button");
    likeBtn.classList.add("btn", "btn-sm", "btn-outline-primary");
    likeBtn.textContent = post.is_liked ? "Unlike" : "Like";
    likeBtn.addEventListener("click", function () {
        return __awaiter(this, void 0, void 0, function* () {
            const updatedPost = yield toggleLikePost(post);
            post = updatedPost;
            const likeElement = (document.getElementById(`likes-${post.id}`));
            likeElement.textContent = updatedPost.likes.toString();
            if (post.is_liked) {
                this.textContent = "unlike";
                this.classList.remove("btn-outline-primary");
                this.classList.add("btn-outline-danger");
            }
            else {
                this.textContent = "like";
                this.classList.remove("btn-outline-danger");
                this.classList.add("btn-outline-primary");
            }
        });
    });
    return likeBtn;
}
function addLikeButton(wrapper, post) {
    const likeButton = document.createElement("button");
    if (typeof post.is_liked != "boolean")
        return;
    likeButton.id = `$like-${post.id}`;
    likeButton.textContent = post.is_liked ? "Unlike" : "Like";
    console.log("adding like button");
    likeButton.addEventListener("click", function (e) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = yield toggleLikePost(post);
            console.log(data);
            const likeElement = (document.getElementById(`likes-${post.id}`));
            post.is_liked = !post.is_liked;
            likeElement.textContent = data.likes.toString();
            this.textContent = data.is_liked ? "unlike" : "like";
        });
    });
    wrapper.appendChild(likeButton);
}
function editPost(id) {
    return __awaiter(this, void 0, void 0, function* () {
        const contentInput = document.getElementById(`${id}`);
        console.log("editing post");
        const response = yield fetch(`../api/posts/edit/${id}`, {
            method: "POST",
            body: JSON.stringify({
                content: contentInput.value,
            }),
        });
        const data = yield response.json();
        if (data.message == "success") {
            console.log("success");
            const wrapperElement = (document.getElementById("post-" + data.post.id.toString()));
            console.log(wrapperElement);
            fillWrapperWithPost(wrapperElement, data.post);
        }
        console.log(data);
    });
}
