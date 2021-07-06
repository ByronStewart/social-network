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
var nextPageButton = document.querySelector("#next-page-btn");
var prevPageButton = document.querySelector("#prev-page-btn");
nextPageButton === null || nextPageButton === void 0 ? void 0 : nextPageButton.addEventListener("click", () => {
    ++offset;
    getAllPosts(offset);
});
prevPageButton === null || prevPageButton === void 0 ? void 0 : prevPageButton.addEventListener("click", () => {
    offset = offset < 1 ? 0 : --offset;
    getAllPosts(offset);
});
createNewPostForm === null || createNewPostForm === void 0 ? void 0 : createNewPostForm.addEventListener("submit", (e) => __awaiter(void 0, void 0, void 0, function* () {
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
        yield getAllPosts(offset);
    }
    else {
        alert(message.error);
    }
}));
function getAllPosts(offset) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("fetching posts");
        const response = yield fetch(`/api/posts?offset=${offset}`);
        posts = (yield response.json());
        console.log(posts);
        const postContainer = document.querySelector("#post-list");
        renderPosts(postContainer, posts.results);
    });
}
getAllPosts(offset);
