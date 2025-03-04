let currentPage = 1;
const token = localStorage.getItem("token");
const user_id = localStorage.getItem("user_id");

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

const handleLogout = (event) => {
    event.preventDefault();

    const token = localStorage.getItem("token");
    const user_id = localStorage.getItem("user_id");

    if (!token || !user_id) {
        window.location.href = "./login.html";
        return;
    }

    fetch("https://aspire-thought-backend.vercel.app/user/logout/", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Token ${token}`
        }
    })
        .then((res) => res.json())
        .then((data) => {
            if (data.success) {
                localStorage.removeItem("token");
                localStorage.removeItem("user_id");
                window.location.href = "./login.html";
            } else {
                console.error("Logout failed:", data);
                Toastify({
                    text: "Session expired, please login again.",
                    duration: 3000,
                    offset: {
                        x: 10,
                        y: 50
                    },
                    style: {
                        background: "#475569",
                    }
                }).showToast();
                window.location.href = "login.html";
            }
        })
        .catch((error) => {
            console.error("Error during logout:", error);
        });
};

const loadNavProfilePicture = () => {
    const user_id = localStorage.getItem("user_id");
    if (!user_id) {
        return;
    }

    fetch(`https://aspire-thought-backend.vercel.app/user/list/${user_id}`)
        .then(res => res.json())
        .then(data => {
            if (data.username) {
                document.getElementById("nav-profile-name").innerText = data.username;
            } else {
                document.getElementById("nav-profile-name").innerText = "Unknown";
            }
            if (data.profile_picture) {
                document.getElementById("nav-profile-image-1").src = data.profile_picture;
                document.getElementById("nav-profile-image-2").src = data.profile_picture;
            } else {
                document.getElementById("nav-profile-image-1").src = "./images/nav/default-user.png";
                document.getElementById("nav-profile-image-2").src = "./images/nav/default-user.png";
            }
        })
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
    document.getElementById("no-topic-followed").classList.add("hidden");
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
    const url = "https://aspire-thought-backend.vercel.app/blog/list/";
    fetchPosts(url, displayPosts);
};


const fetchFollowingPosts = () => {
    const postsSection = document.getElementById("posts-section");
    postsSection.innerHTML = "";
    document.getElementById("no-topic-followed").classList.add("hidden");

    if (!user_id || !token) {
        window.location.href = "login.html";
        return;
    }

    fetch(`https://aspire-thought-backend.vercel.app/user/list/?user_id=${user_id}`)
        .then(res => res.json())
        .then(data => {
            if (data.length > 0) {
                currUser = data[0];
                followedTopic = currUser.following;
                console.log(followedTopic);
                if (followedTopic.length > 0) {
                    const followedTags = followedTopic.map(tag => tag).join(",");
                    const url = `https://aspire-thought-backend.vercel.app/blog/list/?tag_slug=${followedTags}`;
                    fetchPosts(url, displayPosts);
                } else {
                    document.getElementById("no-topic-followed").classList.remove("hidden");
                }

            } else {
                Toastify({
                    text: "Session expired, please login again.",
                    duration: 3000,
                    offset: {
                        x: 10,
                        y: 50
                    },
                    style: {
                        background: "#475569",
                    }
                }).showToast();
                window.location.href = "login";
                return;
            }
        });
};


const fetchStories = () => {
    showSkeleton();
    const url = "https://aspire-thought-backend.vercel.app/blog/stories/";
    fetch(url)
        .then(res => res.json())
        .then(data => {
            if (data.results.length > 0) {
                displayPagination(data, displayStories);
                displayStories(data.results);
            } else {
                showNotFound()
                clearPagination()
            }
        });
};

const displayStories = (stories) => {
    const skeleton = document.getElementById("skeleton-lazy");
    const postsSection = document.getElementById("posts-section");
    const notFound = document.getElementById("not-found");

    skeleton.style.display = "none";
    notFound.style.display = "none";
    postsSection.innerHTML = "";

    const parent = document.createElement("div");
    parent.classList.add("max-w-4xl", "flex", "flex-wrap", "justify-center", "gap-5", "p-3");

    stories.forEach(story => {
        console.log(story);
        const div = document.createElement("div");
        div.classList.add("max-w-4xl", "bg-slate-50", "p-3", "mb-5");

        fetch(`https://aspire-thought-backend.vercel.app/user/list/?user_id=${story.author}`)
            .then(res => res.json())
            .then(userData => {
                if (userData.length > 0) {
                    const user = userData[0];
                    const user_name = user.first_name ? user.first_name : user.username;
                    const verified = user.is_verified ? `<span class="tooltip" data-tip="Verified Author"><i class="fa-solid fa-circle-check text-blue-600"></i></span>` : "";
                    const user_img = user.profile_picture ? user.profile_picture : "./images/nav/default-user.png";

                    div.innerHTML = `
                    <div class="flex items-center gap-3 mb-2">
                        <img onclick="visitAuthorProfile('${user.id}')" src="${user_img}" alt="User Avatar"
                            class="w-10 h-10 object-cover rounded-full cursor-pointer">
                        <div>
                            <p onclick="visitAuthorProfile('${user.id}')" class="text-sm font-medium text-black cursor-pointer">${user_name} ${verified}</p>
                            <p class="text-xs text-slate-500">${story.created_at.slice(0, 10)} • <i
                                    class="fa-solid fa-earth-americas"></i>
                            </p>
                        </div>
                    </div>
        
        
                    <div onclick="redirectToStory('${story.slug}')" class="flex flex-col cursor-pointer">
                        <h1 class="text-md sm:text-lg md:text-xl font-bold text-slate-900 mb-3 hover:underline cursor-pointer">${story.name}</h1>
                        <div class="w-52 md:w-72 flex-shrink-0">
                            <img src="${story.cover}" alt="Blog Image" class="w-full h-auto rounded-lg object-cover">
                        </div>
                    </div>
                    `;
                }
            });


        parent.appendChild(div);
    })
    postsSection.appendChild(parent);
};


const displayPosts = (posts) => {
    const skeleton = document.getElementById("skeleton-lazy");
    const postsSection = document.getElementById("posts-section");
    const notFound = document.getElementById("not-found");

    skeleton.style.display = "none";
    notFound.style.display = "none";
    postsSection.innerHTML = "";

    posts.forEach(post => {
        const div = document.createElement("div");
        div.classList.add("max-w-4xl", "bg-slate-50", "p-3", "mb-5");

        const tag1 = post.tags[0] || null;
        const tag2 = post.tags[1] || null;

        fetch(`https://aspire-thought-backend.vercel.app/user/list/?user_id=${post.author}`)
            .then(res => res.json())
            .then(data => {
                if (data.length > 0) {
                    const author = data[0];

                    const author_name = author.first_name || author.username;
                    const verified = author.is_verified ? `<span class="tooltip" data-tip="Verified Author"><i class="fa-solid fa-circle-check text-blue-600"></i></span>` : "";
                    const author_image = author.profile_picture || "./images/nav/default-user.png";
                    const post_image = post.image ?
                        `<div class="w-32 md:w-52 flex-shrink-0">
                            <img src="${post.image}" alt="Blog Image" class="w-full h-auto rounded-lg object-cover">
                        </div>`
                        : "";

                    // Conditionally render tags
                    const tagsHtml = (tag1 || tag2) ? `
                        <div class="mt-2 flex gap-2" id="tag-section">
                            ${tag1 ? `<span onclick="tagResults('${tag1}')" class="text-xs font-semibold px-3 py-1 bg-slate-200 text-slate-800 rounded-full cursor-pointer">${tag1}</span>` : ""}
                            ${tag2 ? `<span onclick="tagResults('${tag2}')" class="text-xs font-semibold px-3 py-1 bg-slate-200 text-slate-800 rounded-full cursor-pointer">${tag2}</span>` : ""}
                        </div>
                    ` : "";

                    div.innerHTML = `
                        <div class="flex justify-between">
                            <div class="flex items-center gap-3 mb-4">
                                <img onclick="visitAuthorProfile('${author.id}')" src="${author_image}" alt="User Avatar"
                                    class="w-10 h-10 object-cover rounded-full border border-slate-400 cursor-pointer">
                                <div>
                                    <p onclick="visitAuthorProfile('${author.id}')" class="text-sm font-medium text-black cursor-pointer">${author_name} ${verified}</p>
                                    <p class="text-xs text-slate-500">${post.created_at.slice(0, 10)} • <i class="fa-solid fa-earth-americas"></i></p>
                                </div>
                            </div>
                            <div class="tooltip" data-tip="Total Views"><i class="fa-solid fa-eye"></i> ${post.views}</div>
                        </div>

                        <div>
                            <div onclick="redirectToSinglePost('${post.slug}')" class="flex justify-between cursor-pointer">
                                <h1 class="text-md sm:text-xl md:text-2xl font-bold text-slate-900 leading-snug mb-3 hover:underline cursor-pointer">${post.title}</h1>
                                ${post_image}
                            </div>
                            
                            ${tagsHtml}

                            <div class="mt-2 flex justify-between items-center text-slate-600 border-t border-slate-300 pt-2">
                                <p class="flex items-center gap-5 text-xl">
                                    <span onclick="likePost('${post.slug}')" class="flex items-center gap-1 tooltip cursor-pointer" data-tip="Like"><i class="fa-solid fa-thumbs-up"></i> ${post.like_count}</span>
                                    <span onclick="redirectToSinglePost('${post.slug}')" class="flex items-center gap-1 tooltip cursor-pointer" data-tip="Comments"><i class="fa-solid fa-comment"></i> ${post.comment_count}</span>
                                </p>
                                <p class="flex items-center gap-5 text-xl">
                                    <span onclick="bookmarkPost('${post.slug}')" class="cursor-pointer me-3 tooltip" data-tip="Bookmark"><i class="fa-solid fa-bookmark"></i></span>
                                    <span onclick="copyPostLink('${post.slug}')" class="cursor-pointer tooltip" data-tip="Copy Link"><i class="fa-solid fa-link"></i></span>
                                </p>
                            </div>
                        </div>
                    `;
                    postsSection.appendChild(div);
                }
            });
    });
};

async function redirectToSinglePost(slug) {
    try {
        await fetch(`https://aspire-thought-backend.vercel.app/blog/${slug}/view/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ "slug": slug }),
        });

        window.location.href = `single_post.html?slug=${encodeURIComponent(slug)}`;
    } catch (error) {
        console.error("Error increasing view count:", error);
        window.location.href = `single_post.html?slug=${encodeURIComponent(slug)}`;
    }
}

const redirectToStory = (slug) => {
    window.location.href = `story_details.html?story=${slug}`;
};

const addToLibrary = (slug) => {

};

const copyStoryLink = (slug) => {
    const url = `https://aspire-thought.vercel.app/story_details.html?story=${slug}`;

    navigator.clipboard.writeText(url)
        .then(() => {
            Toastify({
                text: `Post link copied to clipboard!`,
                duration: 3000,
                offset: {
                    x: 10,
                    y: 50
                },
                style: {
                    background: "#475569",
                }
            }).showToast();
        })
        .catch(err => {
            console.error("Failed to copy: ", err);
        });
};

const likePost = (slug) => {
    if (!token || !user_id) {
        window.location.href = "login.html";
        return;
    }

    fetch(`https://aspire-thought-backend.vercel.app/blog/${slug}/like/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Token ${token}`,
        }
    })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                Toastify({
                    text: `${data.success}`,
                    duration: 3000,
                    offset: {
                        x: 10,
                        y: 50
                    },
                    style: {
                        background: "#475569",
                    }
                }).showToast();
            } else {
                Toastify({
                    text: `${data.error ? data.error : "Unexpected error occurred!"}`,
                    duration: 3000,
                    offset: {
                        x: 10,
                        y: 50
                    },
                    style: {
                        background: "#475569",
                    }
                }).showToast();
            }
        });
};

const bookmarkPost = (slug) => {
    if (!token || !user_id) {
        window.location.href = "login.html";
        return;
    }

    fetch("https://aspire-thought-backend.vercel.app/user/bookmark/add/", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Token ${token}`,
        },
        body: JSON.stringify({ "slug": slug }),
    })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                Toastify({
                    text: `${data.success}`,
                    duration: 3000,
                    offset: {
                        x: 10,
                        y: 50
                    },
                    style: {
                        background: "#475569",
                    }
                }).showToast();
            } else if (data.error) {
                Toastify({
                    text: `${data.error}`,
                    duration: 3000,
                    offset: {
                        x: 10,
                        y: 50
                    },
                    style: {
                        background: "#475569",
                    }
                }).showToast();
            }
        });
};


const copyPostLink = (slug) => {
    const url = `https://aspire-thought.vercel.app/single_post.html?slug=${slug}`;

    navigator.clipboard.writeText(url)
        .then(() => {
            Toastify({
                text: `Post link copied to clipboard!`,
                duration: 3000,
                offset: {
                    x: 10,
                    y: 50
                },
                style: {
                    background: "#475569",
                }
            }).showToast();
        })
        .catch(err => {
            console.error("Failed to copy: ", err);
        });
};

const visitAuthorProfile = (id) => {
    const url = `visit_profile.html?author_id=${id}`;
    window.location.href = url;
};

document.getElementById("universal-serach-input").addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
        event.preventDefault();
        handleSearch();
    }
});

function handleSearch() {
    const query = document.getElementById("universal-serach-input").value.trim();
    if (query) {
        const url = `https://aspire-thought-backend.vercel.app/blog/list/?title=${query}`;
        fetchPosts(url, displayPosts);
    }
};

const tagResults = (tag_slug) => {
    if (tag_slug != "None")
        window.location.href = `tag_results.html?tag=${tag_slug}`;
};

const fetchAndUpdateTabContent = () => {
    const selectedTab = document.querySelector('input[name="my_tabs_1"]:checked');
    if (!selectedTab) return;

    const selectedTabId = selectedTab.id;
    if (selectedTabId === "recent-tab-selection") {
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

loadNavProfilePicture();
fetchAndUpdateTabContent();