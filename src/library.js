const token = localStorage.getItem("token");
const user_id = localStorage.getItem("user_id");

const profileView = () => {
    if (!token || !user_id) {
        window.location.href = "login.html";
        return;
    }

    fetch(`https://aspire-thought-backend.vercel.app/user/list/?user_id=${user_id}`)
        .then(res => res.json())
        .then(data => {
            if (!data[0]) {
                window.location.href = "login.html";
            }
            const user = data[0];
            if (user.profile_picture) {
                document.getElementById("library-page-profile-picture").src = user.profile_picture;
            }
            const verified = user.is_verified ? `<span class="tooltip" data-tip="Verified Author"><i class="fa-solid fa-circle-check text-blue-600"></i></span>` : "";
            document.getElementById("library-page-username").innerHTML = `${user.username} ${verified}`;
            document.getElementById("library-page-full-name").innerHTML = user.first_name ? user.first_name : "";

            // fetch my library
            user.library.forEach(story_slug => {
                fetch(`https://aspire-thought-backend.vercel.app/blog/stories/?story_slug=${story_slug}`)
                    .then(res => res.json())
                    .then(data => {
                        if (data.results.length > 0) {
                            const story = data.results[0];

                            displayStory(story);
                        }
                    });
            });
        });

};

const displayStory = (story) => {
    const parent = document.getElementById("my-library-section");

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
                <div class="flex justify-between max-w-72">
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
                            <li onclick="removeStory('${story.slug}')"><a><i class="fa-solid fa-ban"></i> Remove Story</a></li>
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


const removeStory = (slug) => {
    if (!token || !user_id) {
        window.location.href = "login.html";
        return;
    }

    fetch("https://aspire-thought-backend.vercel.app/user/library/remove/", {
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
                window.location.href = "library.html";
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

const visitAuthorProfile = (id) => {
    const url = `visit_profile.html?author_id=${id}`;
    window.location.href = url;
};

const tagResults = (tag_slug) => {
    if (tag_slug != "None")
        window.location.href = `tag_results.html?tag=${tag_slug}`;
};

profileView();