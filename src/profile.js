const token = localStorage.getItem("token");
const user_id = localStorage.getItem("user_id");

const profileView = async () => {
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
                document.getElementById("profile-profile-picture").src = user.profile_picture;
            }
            const verified = user.is_verified ? `<span class="tooltip" data-tip="Verified Author"><i class="fa-solid fa-circle-check text-blue-600"></i></span>` : "";
            document.getElementById("profile-username").innerHTML = `${user.username} ${verified}`;
            document.getElementById("profile-email").innerText = user.email;

            if (user.first_name) {
                document.getElementById("profile-full-name").innerHTML = `${user.first_name} ${user.last_name}`;
            } else {
                document.getElementById("profile-full-name").innerHTML = "Unknown";
            }
            if (user.phone_number) {
                document.getElementById("profile-phone").innerText = user.phone_number;
            } else {
                document.getElementById("profile-phone").innerText = "Unknown";
            }
            if (user.date_of_birth) {
                document.getElementById("profile-date-of-birth").innerText = user.date_of_birth;
            } else {
                document.getElementById("profile-date-of-birth").innerText = "Unknown";
            }

            // fetch my posts
            fetch(`https://aspirethought-backend.onrender.com/blog/list/?author_id=${user_id}`)
                .then(res => res.json())
                .then(data => {
                    if (data.results.length > 0) {
                        const posts = data.results;
                        const parent = document.getElementById("my-posts-section");

                        posts.forEach(post => {
                            const post_img = post.image ? post.image : null;
                            const user_name = user.first_name ? user.first_name : user.username;
                            const verified = user.is_verified ? `<span class="tooltip" data-tip="Verified Author"><i class="fa-solid fa-circle-check text-blue-600"></i></span>` : "";
                            const user_img = user.profile_picture ? user.profile_picture : "./images/nav/default-user.png";
                            const tag1 = post.tags[0] ? post.tags[0] : null;
                            const tag2 = post.tags[1] ? post.tags[1] : null;
                            const div = document.createElement("div");
                            div.classList.add("mt-5", "bg-slate-100", "p-2");

                            div.innerHTML = `
                            <div class="flex justify-between">
                                <div class="flex items-center gap-3 mb-2">
                                    <img onclick="visitAuthorProfile('${user.id}')" src="${user_img}" alt="User Avatar"
                                        class="w-10 h-10 object-cover rounded-full border border-slate-400 cursor-pointer">
                                    <div>
                                        <p onclick="visitAuthorProfile('${user.id}')" class="text-sm font-medium text-black cursor-pointer">${user_name} ${verified}</p>
                                        <p class="text-xs text-slate-500">${post.created_at.slice(0, 10)} • <i
                                                class="fa-solid fa-earth-americas"></i>
                                        </p>
                                    </div>
                                </div>
                                <div class="dropdown dropdown-end font-bold">
                                    <div tabindex="0" role="button" class="btn m-1 text-xl bg-slate-100 border-none rounded-full"><i class="fa-solid fa-ellipsis"></i></div>
                                    <ul tabindex="0" class="menu dropdown-content bg-slate-200 rounded-md z-[1] w-52 p-2 shadow-xl">
                                        <li onclick="bookmarkPost('${post.slug}')"><a><i class="fa-solid fa-bookmark"></i> Save to Bookmark</a></li>
                                        <li onclick="copyPostLink('${post.slug}')"><a><i class="fa-solid fa-link"></i> Copy Link</a></li>
                                        <li onclick="editPost('${post.slug}')"><a><i class="fa-solid fa-pen"></i> Edit Post</a></li>
                                        <li onclick="deletePost('${post.slug}')"><a><i class="fa-solid fa-trash"></i> Delete Post</a></li>
                                    </ul>
                                </div>
                            </div>
        
        
                            <div class="">
                                <div onclick="redirectToSinglePost('${post.slug}')" class="flex justify-between cursor-pointer">
                                    <h1 class="text-md sm:text-xl md:text-2xl font-bold text-slate-900 leading-snug mb-3 hover:underline cursor-pointer">${post.title}</h1>
                                    ${post_img ? `
                                        <div class="w-32 md:w-52 flex-shrink-0">
                                            <img src="${post_img}" alt="Blog Image"
                                            class="w-full h-auto rounded-lg object-cover">
                                        </div>
                                    ` : ""}
                                   
                                </div>
        
                                <div class="mt-2 flex gap-2">
                                    ${tag1 ? `<span onclick="tagResults('${tag1}')" 
                                        class="text-xs font-semibold px-3 py-1 bg-slate-200 text-slate-800 rounded-full cursor-pointer">${tag1}</span>` : ""}
                                    ${tag2 ? `<span onclick="tagResults('${tag2}')" 
                                        class="text-xs font-semibold px-3 py-1 bg-slate-200 text-slate-800 rounded-full cursor-pointer">${tag2}</span>` : ""}
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
                        });
                    }
                });
        });

    const myStoriesRes = await fetch(`https://aspirethought-backend.onrender.com/blog/stories/?author_id=${user_id}`)
    const myStories = await myStoriesRes.json();
    if (myStories.results.length > 0) {
        displayStories(myStories.results);
    } else {
        document.getElementById("my-stories-section").innerHTML = `
            <div class="flex justify-center">
                <a href="stories.html" class="btn bg-transparent hover:bg-green-600 rounded-full border border-black hover:text-white">
                    <i class="fa-solid fa-pen-to-square"></i>
                    Write your first story!
                </a>
            </div>
        `;
    }
};

const displayStories = (stories) => {
    const parent = document.getElementById("my-stories-section");

    stories.forEach(story => {
        const div = document.createElement("div");
        div.classList.add("max-w-4xl", "bg-slate-50", "p-3", "mb-5");

        fetch(`https://aspirethought-backend.onrender.com/user/list/?user_id=${story.author}`)
            .then(res => res.json())
            .then(userData => {
                if (userData.length > 0) {
                    const user = userData[0];
                    const user_name = user.first_name ? user.first_name : user.username;
                    const verified = user.is_verified ? `<span class="tooltip" data-tip="Verified Author"><i class="fa-solid fa-circle-check text-blue-600"></i></span>` : "";
                    const user_img = user.profile_picture ? user.profile_picture : "./images/nav/default-user.png";

                    div.innerHTML = `
                    <div class="flex justify-between">
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

                        <div class="dropdown dropdown-end font-bold">
                            <div tabindex="0" role="button" class="btn m-1 text-xl bg-slate-100 border-none rounded-full"><i class="fa-solid fa-ellipsis"></i></div>
                            <ul tabindex="0" class="menu dropdown-content bg-slate-200 rounded-md z-[1] w-52 p-2 shadow-xl">
                                <li onclick="copyStoryLink('${story.slug}')"><a><i class="fa-solid fa-link"></i> Copy Link</a></li>
                                <li onclick="deleteStory('${story.slug}')"><a><i class="fa-solid fa-trash"></i> Delete Story</a></li>
                            </ul>
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
};

const copyPostLink = (slug) => {
    const url = `https://mdshakib007.github.io/AspireThought_Frontend/single_post.html?slug=${slug}`;

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

const copyStoryLink = (slug) => {
    const url = `https://mdshakib007.github.io/AspireThought_Frontend/story_details.html?story=${slug}`;

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

const redirectToStory = (slug) => {
    window.location.href = `story_details.html?story=${slug}`;
};

const deletePost = async (slug) => {
    try {
        const response = await fetch("https://aspirethought-backend.onrender.com/blog/delete/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Token ${token}`,
            },
            body: JSON.stringify({ "post_slug": slug }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        if (data.success) {
            window.location.href = "profile.html";
        } else {
            Toastify({
                text: `${data.error || "Something went wrong!"}`,
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

    } catch (error) {
        console.error("Error deleting post:", error);
        Toastify({
            text: `Failed to delete the post. Please try again!`,
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
};

const deleteStory = async (slug) => {
    try {
        const response = await fetch(`https://aspirethought-backend.onrender.com/blog/stories/${slug}/delete/`, {
            method: "DELETE",
            headers: {
                "Authorization": `Token ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        if (data.success) {
            window.location.href = "profile.html";
        } else {
            Toastify({
                text: `${data.successdata.error || "Something went wrong!"}`,
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

    } catch (error) {
        console.error("Error deleting post:", error);
        Toastify({
            text: `Failed to delete the post. Please try again!`,
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
};

const editPost = (slug) => {
    window.location.href = `create_post.html?mode=editing&post=${slug}`;
};

const visitAuthorProfile = (id) => {
    const url = `visit_profile.html?author_id=${id}`;
    window.location.href = url;
};

const tagResults = (tag_slug) => {
    if (tag_slug != "None")
        window.location.href = `tag_results.html?tag=${tag_slug}`;
};

profileView();