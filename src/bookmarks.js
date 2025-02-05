const token = localStorage.getItem("token");
const user_id = localStorage.getItem("user_id");

const profileView = () => {
    if (!token || !user_id) {
        window.location.href = "login.html";
        return;
    }

    fetch(`https://aspirethought-backend.onrender.com/user/list/?user_id=${user_id}`)
        .then(res => res.json())
        .then(data => {
            if (!data[0]) {
                window.location.href = "login.html";
            }
            const user = data[0];
            if (user.profile_picture) {
                document.getElementById("bookmark-page-profile-picture").src = user.profile_picture;
            }
            const verified = user.is_verified ? `<span class="tooltip" data-tip="Verified Author"><i class="fa-solid fa-circle-check text-blue-600"></i></span>` : "";
            document.getElementById("bookmark-page-username").innerHTML = `${user.username} ${verified}`;
            document.getElementById("bookmark-page-full-name").innerHTML = user.first_name ? user.first_name : "";

            // fetch my bookmarks
            user.bookmarks.forEach(post_slug => {
                fetch(`https://aspirethought-backend.onrender.com/blog/list/?post_slug=${post_slug}`)
                    .then(res => res.json())
                    .then(data => {
                        if (data.results.length > 0) {
                            const post = data.results[0];
                            const parent = document.getElementById("my-bookmarks-section");

                            fetch(`https://aspirethought-backend.onrender.com/user/list/?user_id=${post.author}`)
                                .then(res => res.json())
                                .then(postAuthor => {
                                    if (postAuthor.length > 0) {
                                        const post_author = postAuthor[0];

                                        const post_img = post.image ? post.image : "./images/up-aspireThought.png";
                                        const user_name = post_author.first_name ? post_author.first_name : post_author.username;
                                        const verified = post_author.is_verified ? `<span class="tooltip" data-tip="Verified Author"><i class="fa-solid fa-circle-check text-blue-600"></i></span>` : "";
                                        const user_img = post_author.profile_picture ? post_author.profile_picture : "./images/nav/default-user.png";
                                        const tag1 = post.tags[0] ? post.tags[0] : "None";
                                        const tag2 = post.tags[1] ? post.tags[1] : "None";
                                        const div = document.createElement("div");
                                        div.classList.add("mt-10", "bg-slate-100", "p-2");

                                        div.innerHTML = `
                                <div class="flex justify-between">
                                    <div class="flex items-center gap-3 mb-2">
                                        <img onclick="visitAuthorProfile('${post_author.id}')" src="${user_img}" alt="User Avatar"
                                            class="w-10 h-10 object-cover rounded-full border border-slate-400 cursor-pointer">
                                        <div>
                                            <p onclick="visitAuthorProfile('${post_author.id}')" class="text-sm font-medium text-black cursor-pointer">${user_name} ${verified}</p>
                                            <p class="text-xs text-slate-500">${post.created_at.slice(0, 10)} • <i
                                                    class="fa-solid fa-earth-americas"></i>
                                            </p>
                                        </div>
                                    </div>
                                    <div class="dropdown dropdown-end font-bold">
                                        <div tabindex="0" role="button" class="btn m-1 text-xl bg-slate-100 border-none rounded-full"><i class="fa-solid fa-ellipsis"></i></div>
                                        <ul tabindex="0" class="menu dropdown-content bg-slate-200 rounded-md z-[1] w-52 p-2">
                                            <li onclick="copyPostLink('${post.slug}')"><a><i class="fa-solid fa-link"></i> Copy Link</a></li>
                                            <li onclick="removeBookmarkPost('${post.slug}')"><a><i class="fa-solid fa-ban"></i> Remove Bookmark</a></li>
                                        </ul>
                                    </div>
                                </div>
            
            
                                <div class="">
                                    <div onclick="redirectToSinglePost('${post.slug}')" class="flex justify-between cursor-pointer">
                                        <h1 class="text-md sm:text-xl md:text-2xl font-bold text-slate-900 leading-snug mb-3 hover:underline cursor-pointer">${post.title}</h1>
                                        <div class="w-32 md:w-52 flex-shrink-0">
                                            <img src="${post_img}" alt="Blog Image"
                                                class="w-full h-auto rounded-lg object-cover">
                                        </div>
                                    </div>
            
                                    <div class="mt-2 flex gap-2">
                                        <span onclick="tagResults('${tag1}')" 
                                            class="text-xs font-semibold px-3 py-1 bg-slate-200 text-slate-800 rounded-full cursor-pointer">${tag1}</span>
                                        <span onclick="tagResults('${tag2}')" 
                                            class="text-xs font-semibold px-3 py-1 bg-slate-200 text-slate-800 rounded-full cursor-pointer">${tag2}</span>
                                    </div>
            
                                    <div class="mt-2 pt-2 flex justify-between items-center text-slate-600 border-t border-slate-300">
                                        <p class="flex items-center gap-5 text-xl">
                                            <span onclick="likePost('${post.slug}')" class="flex items-center gap-1 tooltip cursor-pointer" data-tip="Like"><i
                                                    class="fa-solid fa-thumbs-up"></i> ${post.like_count}</span>
                                            <span onclick="redirectToSinglePost('${post.slug}')" class="flex items-center gap-1 tooltip cursor-pointer" data-tip="Comments"><i
                                                    class="fa-solid fa-comment"></i> ${post.comment_count}</span>
                                        </p>
                                        <p class="tooltip" data-tip="Total Views"><i class="fa-solid fa-eye"></i> ${post.views}</p>
                                    </div>
                                </div>
                            `;
                                        parent.appendChild(div);

                                    }
                                });
                        }
                    });
            });
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


const removeBookmarkPost = (slug) => {
    if (!token || !user_id) {
        window.location.href = "login.html";
        return;
    }

    fetch("https://aspirethought-backend.onrender.com/user/bookmark/remove/", {
        method: "DELETE",
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
                window.location.href = "bookmarks.html";
            } else if (data.error) {
                alert(data.error);
            }
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

const visitAuthorProfile = (id) => {
    const url = `https://mdshakib007.github.io/AspireThought_Frontend/visit_profile.html?author_id=${id}`;
    window.location.href = url;
};

const tagResults = (tag_slug) => {
    if (tag_slug != "None")
        window.location.href = `tag_results.html?tag=${tag_slug}`;
};

profileView();