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
console.log('hello from profile');
const followBtn = document.querySelector("#follow-btn");
followBtn === null || followBtn === void 0 ? void 0 : followBtn.addEventListener("click", (e) => __awaiter(void 0, void 0, void 0, function* () {
    const status = followBtn.getAttribute("data-follow-status") == "true" ? true : false;
    const profileId = window.location.href.split("/").slice(-1).pop();
    const response = yield fetch("../api/user/follow", {
        method: "POST",
        body: JSON.stringify({
            profileId,
            wantsToFollow: status ? false : true
        })
    });
    const data = yield response.json();
    if (response.ok) {
        followBtn.textContent = status ? "Follow" : "Unfollow";
        followBtn.setAttribute("data-follow-status", !status ? "true" : "false");
    }
    console.log(data);
}));
function getAllUserPosts() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("fetching posts");
        const url = window.location.href;
        // get the user id from the url
        const userId = url.split("/").slice(-1).pop();
        const response = yield fetch(`/api/posts/${userId}`);
        posts = (yield response.json());
        const postContainer = document.querySelector("#post-list");
        postContainer.innerHTML = "";
        for (const post of posts) {
            postContainer.appendChild(createPostElement(post));
        }
    });
}
getAllUserPosts();
