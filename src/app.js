let currentPage = 1;

const hideBottomPostBtn = (event) => {
    event.preventDefault();
    document.getElementById("bottom-post-btn").style.display = "none";
};

const showSkeleton = () => {
    document.getElementById("skeleton-lazy").style.display = "flex";
    document.getElementById("posts-section").innerHTML = "";
    document.getElementById("not-found").style.display = "none";
};

const showNotFound = () => {
    document.getElementById("skeleton-lazy").style.display = "none";
    document.getElementById("not-found").style.display = "block";
};

const clearPagination = () => {
    document.getElementById("pagination-controls").innerHTML = "";
};

const displayPagination = (data, displayCallback) => {
    const paginationContainer = document.getElementById("pagination-controls");
    paginationContainer.innerHTML = "";

    if (data.previous) {
        const prevButton = document.createElement("button");
        prevButton.innerHTML = `<i class="fa-solid fa-arrow-left"></i> Previous`;
        prevButton.classList.add("btn", "bg-gray-200", "text-gray-600", "px-4", "py-2", "rounded-lg", "hover:bg-gray-300", "transition");
        prevButton.addEventListener("click", () => {
            fetchPosts(data.previous, displayCallback);
        });
        paginationContainer.appendChild(prevButton);
    }

    if (data.next) {
        const nextButton = document.createElement("button");
        nextButton.innerHTML = `Next <i class="fa-solid fa-arrow-right"></i>`;
        nextButton.classList.add("btn", "bg-gray-200", "text-gray-600", "px-4", "py-2", "rounded-lg", "hover:bg-gray-300", "transition");
        nextButton.addEventListener("click", () => {
            fetchPosts(data.next, displayCallback);
        });
        paginationContainer.appendChild(nextButton);
    }
};

const fetchPosts = (url, displayCallback) => {
    showSkeleton();
    fetch(url)
        .then(res => res.json())
        .then(data => {
            if (data.results && data.results.length > 0) {
                displayCallback(data.results);
                displayPagination(data, displayCallback);
            } else {
                showNotFound();
                clearPagination();
            }
        })
        .catch(error => {
            console.error("Error fetching posts:", error);
            showNotFound();
            clearPagination();
        });
};

const fetchRecentPosts = () => {
    const url = "https://aspirethought-backend.onrender.com/blog/list/";
    fetchPosts(url, displayRecentPosts);
};

const displayRecentPosts = (posts) => {
    const skeleton = document.getElementById("skeleton-lazy");
    const postsSection = document.getElementById("posts-section");
    const notFound = document.getElementById("not-found");

    skeleton.style.display = "none";
    notFound.style.display = "none";
    postsSection.innerHTML = "";

    posts.forEach(post => {
        const div = document.createElement("div");
        div.classList.add("max-w-4xl", "bg-slate-50", "p-3", "rounded-lg", "mb-5");

        const tag1 = post.tags[0] ? post.tags[0] : "None";
        const tag2 = post.tags[1] ? post.tags[1] : "None";

        fetch(`https://aspirethought-backend.onrender.com/user/list/?user_id=${post.author}`)
            .then(res => res.json())
            .then(data => {
                if (data.length > 0) {
                    const author = data[0];
                    
                    const author_name = author.first_name ? author.first_name : author.username;
                    const verified = author.is_verified ? `<span class="tooltip" data-tip="Verified Author"><i class="fa-solid fa-circle-check text-blue-600"></i></span>` : "";
                    const author_image = author.profile_picture ? author.profile_picture : "./images/nav/default-user.png";
                    const post_image = post.image ? post.image : "./images/up-aspireThought.png";

                    div.innerHTML = `
                        <div class="flex items-center gap-3 mb-2">
                            <img src="${author_image}" alt="User Avatar"
                                class="w-10 h-10 object-cover rounded-full border border-slate-400">
                            <div>
                                <p class="text-sm font-medium text-black">${author_name} ${verified}</p>
                                <p class="text-xs text-slate-500">${post.created_at.slice(0, 10)} • <i class="fa-solid fa-earth-americas"></i></p>
                            </div>
                        </div>
            
                        <div onclick="redirectToSinglePost('${post.slug}')" class="cursor-pointer" >
                            <div class="flex justify-between">
                                <h1 class="text-2xl font-bold text-slate-900 leading-snug mb-3 hover:underline cursor-pointer">${post.title}</h1>
                                <div class="w-40 md:w-52 flex-shrink-0">
                                    <img src="${post_image}" alt="Blog Image"
                                        class="w-full h-auto rounded-lg object-cover">
                                </div>
                            </div>
            
                            <div class="mt-2 flex gap-2">
                                <span class="text-xs font-semibold px-3 py-1 bg-slate-200 text-slate-800 rounded-full cursor-pointer">${tag1}</span>
                                <span class="text-xs font-semibold px-3 py-1 bg-slate-200 text-slate-800 rounded-full cursor-pointer">${tag2}</span>
                            </div>
            
                            <div class="mt-4 flex justify-between items-center text-slate-600">
                                <p class="flex items-center gap-3 text-lg">
                                    <span class="flex items-center gap-1 tooltip" data-tip="Like"><i class="fa-solid fa-thumbs-up"></i> ${post.like_count}</span>
                                    <span class="flex items-center gap-1 tooltip" data-tip="Comments"><i class="fa-solid fa-comment"></i> ${post.comment_count}</span>
                                </p>
                                <p class="flex items-center gap-3 text-lg">
                                    <span class="cursor-pointer me-3 tooltip" data-tip="Bookmark"><i class="fa-solid fa-bookmark"></i></span>
                                    <span class="cursor-pointer tooltip" data-tip="More"><i class="fa-solid fa-ellipsis"></i></span>
                                </p>
                            </div>
                        </div>
                    `;
                    postsSection.appendChild(div);
                }
            });
    });
};

function redirectToSinglePost(slug) {
    window.location.href = `single_post.html?slug=${encodeURIComponent(slug)}`;
}


const fetchAndUpdateTabContent = () => {
    const selectedTab = document.querySelector('input[name="my_tabs_1"]:checked');
    if (!selectedTab) return;

    const selectedTabId = selectedTab.id;
    if (selectedTabId === "recomendation-tab-selection") {
        fetchRecomendations();
    } else if (selectedTabId === "recent-tab-selection") {
        fetchRecentPosts();
    } else if (selectedTabId === "following-tab-selection") {
        fetchFollowingPosts();
    } else if (selectedTabId === "story-tab-selection") {
        fetchStories();
    }
};

document.querySelectorAll('input[name="my_tabs_1"]').forEach(tab => {
    tab.addEventListener("change", fetchAndUpdateTabContent);
});

const fetchRecomendations = () => {
    const url = "https://aspirethought-backend.onrender.com/blog/list/";
    fetchPosts(url, (posts) => {
        const postsSection = document.getElementById("posts-section");
        postsSection.innerHTML = "Coming Soon!";
        document.getElementById("skeleton-lazy").style.display = "none";
        clearPagination();
    });
};

const fetchFollowingPosts = () => {
    const url = "https://aspirethought-backend.onrender.com/blog/list/";
    fetchPosts(url, (posts) => {
        const postsSection = document.getElementById("posts-section");
        postsSection.innerHTML = "Coming Soon!";
        document.getElementById("skeleton-lazy").style.display = "none";
        clearPagination();
    });
};

const fetchStories = () => {
    const url = "https://aspirethought-backend.onrender.com/blog/list/";
    fetchPosts(url, (posts) => {
        const postsSection = document.getElementById("posts-section");
        postsSection.innerHTML = "Coming Soon!";
        document.getElementById("skeleton-lazy").style.display = "none";
        clearPagination();
    });
};

fetchAndUpdateTabContent();
