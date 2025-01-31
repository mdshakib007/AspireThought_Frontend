let currentPage = 1;

const hideBottomPostBtn = (event) => {
    event.preventDefault();
    document.getElementById("bottom-post-btn").style.display = "none";
};

const showSkeleton = () => {
    const skeleton = document.getElementById("skeleton-lazy");
    const postsSection = document.getElementById("posts-section");
    const notFound = document.getElementById("not-found");

    postsSection.innerHTML = "";
    notFound.style.display = "none";
    skeleton.style.display = "flex";
};

const showNotFound = () => {
    const skeleton = document.getElementById("skeleton-lazy");
    const notFound = document.getElementById("not-found");

    skeleton.style.display = "none";
    notFound.style.display = "block";
};

const fetchAndUpdateTabContent = () => {
    const selectedTab = document.querySelector('input[name="my_tabs_1"]:checked');
    if (!selectedTab) return;

    const selectedTabId = selectedTab.id;

    if (selectedTabId === "recomendation-tab-selection") {
        console.log("Fetching Recommendations...");
    } else if (selectedTabId === "recent-tab-selection") {
        fetchRecentPosts();
    } else if (selectedTabId === "following-tab-selection") {
        console.log("Fetching Following Posts...");
    } else if (selectedTabId === "story-tab-selection") {
        console.log("Fetching Stories...");
    }
};

document.querySelectorAll('input[name="my_tabs_1"]').forEach(tab => {
    tab.addEventListener("change", fetchAndUpdateTabContent);
});

const fetchRecentPosts = () => {
    showSkeleton();

    fetch("http://127.0.0.1:8000/blog/list/")
        .then(res => res.json())
        .then(data => {
            if (data.results.length > 0) {
                displayRecentPosts(data.results);
            } else {
                showNotFound();
            }
        });
};

const displayRecentPosts = (posts) => {
    const skeleton = document.getElementById("skeleton-lazy");
    const postsSection = document.getElementById("posts-section");
    const notFound = document.getElementById("not-found");

    skeleton.style.display = "none";
    notFound.style.display = "none";
    postsSection.innerHTML = "";

    posts.forEach(post => {
        console.log(post);
        const div = document.createElement("div");
        div.classList.add("max-w-4xl", "bg-slate-50", "p-3", "rounded-lg", "mb-5");

        // fetch for user information
        fetch(`http://127.0.0.1:8000/user/list/?user_id=${post.author}`)
            .then(res => res.json())
            .then(data => {
                if (data.length > 0) {
                    const author = data[0];


                    div.innerHTML = `
                        <div class="flex items-center gap-3 mb-2">
                            <img src="../images/nav/default-user.png" alt="User Avatar"
                                class="w-10 h-10 object-cover rounded-full border border-slate-400">
                            <div>
                                <p class="text-sm font-medium text-black">${author.username}</p>
                                <p class="text-xs text-slate-500">${post.created_at.slice(0, 10)} <i class="fa-solid fa-earth-americas"></i></p>
                            </div>
                        </div>
            
                        <div class="">
                            <div class="flex justify-between">
                            
                                <h1 class="text-2xl font-bold text-slate-900 leading-snug mb-3 hover:underline">${post.title}</h1>
                                    
                                <div class="w-40 md:w-52 flex-shrink-0">
                                    <img src="${post.image}" alt="Blog Image"
                                        class="w-full h-auto rounded-lg object-cover">
                                </div>
                            </div>
            
                            <div class="mt-2 flex gap-2">
                                <span
                                    class="text-xs font-semibold px-3 py-1 bg-slate-200 text-slate-800 rounded-full cursor-pointer">Tag
                                    1</span>
                                <span
                                    class="text-xs font-semibold px-3 py-1 bg-slate-200 text-slate-800 rounded-full cursor-pointer">Tag
                                    2</span>
                            </div>
            
                            <div class="mt-4 flex justify-between items-center text-slate-600">
                                <p class="flex items-center gap-3 text-lg">
                                    <span class="flex items-center gap-1 tooltip" data-tip="Like"><i
                                            class="fa-solid fa-thumbs-up"></i> 54</span>
                                    <span class="flex items-center gap-1 tooltip" data-tip="Comments"><i
                                            class="fa-solid fa-comment"></i> 25</span>
                                </p>
                                <p class="flex items-center gap-3 text-lg">
                                    <span class="cursor-pointer me-3 tooltip" data-tip="Bookmark"><i
                                            class="fa-solid fa-bookmark"></i></span>
                                    <span class="cursor-pointer tooltip" data-tip="More"><i
                                            class="fa-solid fa-ellipsis"></i></span>
                                </p>
                            </div>
                        </div>
                    `;
                    postsSection.appendChild(div);
                }
            });

    });
};
