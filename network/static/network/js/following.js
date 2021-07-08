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
var nextPageButton = document.querySelector("#next-page-btn");
var prevPageButton = document.querySelector("#prev-page-btn");
nextPageButton === null || nextPageButton === void 0 ? void 0 : nextPageButton.addEventListener("click", () => {
    getAllFollowingPosts(posts.next);
});
prevPageButton === null || prevPageButton === void 0 ? void 0 : prevPageButton.addEventListener("click", () => {
    getAllFollowingPosts(posts.previous);
});
function getAllFollowingPosts(offset) {
    return __awaiter(this, void 0, void 0, function* () {
        // get the user id from the url
        const response = yield fetch(`/api/posts/following?offset=${offset}`);
        posts = (yield response.json());
        const postContainer = document.querySelector("#post-list");
        renderPosts(postContainer, posts.results);
    });
}
getAllFollowingPosts(posts.next);
