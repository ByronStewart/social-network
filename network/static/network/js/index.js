var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
function getAllPosts() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("fetching posts");
        const response = yield fetch("/api/posts");
        const posts = yield response.json();
        console.log(posts);
        const postContainer = document.querySelector("#post-list");
        for (const post of posts) {
            postContainer.appendChild(createPostElement(post));
        }
    });
}
function createPostElement(post) {
    const wrapper = document.createElement("div");
    wrapper.classList.add("mb-3", "row", "p-5", "bg-dark", "text-white");
    const creatorH5 = document.createElement("h5");
    creatorH5.textContent = post.creator;
    wrapper.appendChild(creatorH5);
    const contentP = document.createElement("p");
    contentP.textContent = post.content;
    wrapper.appendChild(contentP);
    return wrapper;
}
console.log('hello world');
getAllPosts();
