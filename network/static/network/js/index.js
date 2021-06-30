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
const createNewPostForm = document.querySelector("#create-new-post-form");
createNewPostForm.addEventListener("submit", (e) => __awaiter(void 0, void 0, void 0, function* () {
    e.preventDefault();
    const contentElement = document.querySelector("#post-content");
    const content = contentElement.value;
    contentElement.value = "";
    contentElement.focus();
    console.log("submitting form", content);
    // send the content to the server
    const response = yield fetch("api/posts/new", {
        method: "POST",
        body: JSON.stringify({
            content
        })
    });
    const message = yield response.json();
    if (response.ok) {
        // reload the posts
        yield getAllPosts();
    }
    else {
        alert(message.error);
    }
}));
function getAllPosts() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("fetching posts");
        const response = yield fetch("/api/posts");
        posts = (yield response.json());
        console.log(posts);
        const postContainer = document.querySelector("#post-list");
        postContainer.innerHTML = "";
        for (const post of posts) {
            postContainer.appendChild(createPostElement(post));
        }
    });
}
getAllPosts();
