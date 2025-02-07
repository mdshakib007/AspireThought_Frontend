const user_id = localStorage.getItem("user_id");
const token = localStorage.getItem("token");
const params = new URLSearchParams(window.location.search);
const tag = params.get('tag');

const showSkeleton = () => {
    document.getElementById("skeleton-lazy").style.display = "flex";
    document.getElementById("tag-results-section").innerHTML = "";
};

const expandTags = () => {
    const parent = document.getElementById("tags-section");
    parent.innerHTML = "";
    parent.classList.add("max-h-72", "overflow-y-scroll", "m-2", "flex", "gap-2", "flex-wrap",);

    fetch("https://aspirethought-backend.onrender.com/tag/list/")
        .then(res => res.json())
        .then(tags => {
            tags.forEach(tag => {
                const p = document.createElement("p");
                p.classList.add("border", "border-slate-500", "rounded-full", "px-3", "py-2", "text-slate-700", "cursor-pointer", "hover:bg-slate-100");
                p.innerText = tag.name;
                p.onclick = () => {
                    const newUrl = new URL(window.location);
                    newUrl.searchParams.set('tag', tag.slug);
                    window.history.pushState({}, '', newUrl);

                    fetchTagResult(tag.slug);
                };
                parent.appendChild(p);
            });
        });
};

const recommendedPostsFetch = () => {
    fetch("https://aspirethought-backend.onrender.com/blog/list/")
        .then(res => res.json())
        .then(data => {
            const title = document.getElementById("recommended-posts-title");
            title.classList.remove("hidden");
            title.innerText = "Recommended";

            displayPost(data.results, "recommended-posts-section");
        });
};

const fetchTagResult = async (tag_slug) => {
    try {
        // Fetch followers and posts in parallel
        const [followersRes, postsRes] = await Promise.all([
            fetch(`https://aspirethought-backend.onrender.com/tag/list/?slug=${tag_slug}`).then(res => res.json()),
            fetch(`https://aspirethought-backend.onrender.com/blog/list/?tag_slug=${tag_slug}`).then(res => res.json())
        ]);

        // Get followers count
        const followers = followersRes[0].followers || 0;
        const posts = postsRes.results || [];

        console.log(posts);

        // Update UI
        document.getElementById("current-tag-name").innerText = tag_slug;
        document.getElementById("tag-results-page-followers-and-stories").innerText =
            `Topic • ${followers} Followers • 0 Stories • ${posts.length} Posts`;

        followStatus(tag_slug);

        const title = document.getElementById("tag-results-title");
        title.classList.remove("hidden");
        title.innerHTML = `${posts.length} Results for <span class="font-bold">${tag_slug}</span>`;

        document.getElementById("tag-follow-btn").onclick = () => {
            followTopic(tag_slug);
        };

        displayPost(posts, "tag-results-section");

    } catch (error) {
        console.error("Error fetching tag data:", error);
    }
};


const displayPost = (posts, section) => {
    const skeleton = document.getElementById("skeleton-lazy");
    const postsSection = document.getElementById(section);

    skeleton.style.display = "none";
    postsSection.innerHTML = "";

    posts.forEach(post => {
        const div = document.createElement("div");
        div.classList.add("max-w-4xl", "bg-slate-100", "p-3", "mb-5");

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
                        <div class="flex justify-between">
                            <div class="flex items-center gap-3 mb-4">
                                <img onclick="visitAuthorProfile('${author.id}')" src="${author_image}" alt="User Avatar"
                                    class="w-10 h-10 object-cover rounded-full border border-slate-400 cursor-pointer">
                                <div>
                                    <p  onclick="visitAuthorProfile('${author.id}')" class="text-sm font-medium text-black cursor-pointer">${author_name} ${verified}</p>
                                    <p class="text-xs text-slate-500">${post.created_at.slice(0, 10)} • <i class="fa-solid fa-earth-americas"></i></p>
                                </div>
                            </div>
                            <div class="tooltip" data-tip="Total Views"><i class="fa-solid fa-eye"></i> ${post.views}</div>
                        </div>

                        <div class="" >
                            <div onclick="redirectToSinglePost('${post.slug}')" class="flex justify-between cursor-pointer">
                                <h1 class="text-md sm:text-xl md:text-2xl font-bold text-slate-900 leading-snug mb-3 hover:underline cursor-pointer">${post.title}</h1>
                                <div class="w-32 md:w-52 flex-shrink-0">
                                    <img src="${post_image}" alt="Blog Image"
                                        class="w-full h-auto rounded-lg object-cover">
                                </div>
                            </div>
            
                            <div class="mt-2 flex gap-2" id="tag-section">
                                <span onclick="tagResults('${tag1}')" class="text-xs font-semibold px-3 py-1 bg-slate-200 text-slate-800 rounded-full cursor-pointer">${tag1}</span>
                                <span onclick="tagResults('${tag2}')" class="text-xs font-semibold px-3 py-1 bg-slate-200 text-slate-800 rounded-full cursor-pointer">${tag2}</span>
                            </div>
            
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
        await fetch(`https://aspirethought-backend.onrender.com/blog/${slug}/view/`, {
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

const followTopic = (topic) => {
    if (!token || !user_id) {
        window.location.href = "login.html";
        return;
    }

    fetch(`https://aspirethought-backend.onrender.com/user/following/topic/add/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Token ${token}`,
        },
        body: JSON.stringify({ "slug": topic }),
    })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                fetchTagResult(topic);
            }
            else if (data.error) alert(data.error);
            else alert("Something went wrong.");
        });
};

const followStatus = (topic) => {
    const followBtn = document.getElementById("tag-follow-btn");
    const following = document.getElementById("tag-following-btn");
    if (!token || !user_id) {
        followBtn.classList.remove("hidden");
        following.classList.add("hidden");
        return;
    }

    fetch(`https://aspirethought-backend.onrender.com/user/list/?user_id=${user_id}`)
        .then(res => res.json())
        .then(data => {
            if (data.length > 0) {
                const user = data[0];
                user.following.forEach(followed => {
                    if (followed === topic) {
                        following.classList.remove("hidden");
                        followBtn.classList.add("hidden");
                        return;
                    }
                });
            }
        });
    followBtn.classList.remove("hidden");
    following.classList.add("hidden");
};


const likePost = (slug) => {
    if (!token || !user_id) {
        window.location.href = "login.html";
        return;
    }

    fetch(`https://aspirethought-backend.onrender.com/blog/${slug}/like/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Token ${token}`,
        }
    })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                alert(data.success);
            } else {
                alert(data.error ? data.error : "Unexpected error occurred!");
            }
        });
};

const bookmarkPost = (slug) => {
    if (!token || !user_id) {
        window.location.href = "login.html";
        return;
    }

    fetch("https://aspirethought-backend.onrender.com/user/bookmark/add/", {
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
                alert(data.success);
            } else if (data.error) {
                alert(data.error);
            }
        });
};


const copyPostLink = (slug) => {
    const url = `https://mdshakib007.github.io/AspireThought_Frontend/single_post.html?slug=${slug}`;

    navigator.clipboard.writeText(url)
        .then(() => {
            console.log("Post link copied to clipboard!");
        })
        .catch(err => {
            console.error("Failed to copy: ", err);
        });
};

const visitAuthorProfile = (id) => {
    const url = `visit_profile.html?author_id=${id}`;
    window.location.href = url;
};

const tagResults = (tag_slug) => {
    if (tag_slug != "None")
        window.location.href = `tag_results.html?tag=${tag_slug}`;
};

if (tag) {
    fetchTagResult(tag);
}
recommendedPostsFetch();
