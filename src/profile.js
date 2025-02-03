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
                            const post_img = post.image ? post.image : "./images/up-aspireThought.png";
                            const user_name = user.first_name ? user.first_name : user.username;
                            const verified = user.is_verified ? `<span class="tooltip" data-tip="Verified Author"><i class="fa-solid fa-circle-check text-blue-600"></i></span>` : "";
                            const user_img = user.profile_picture ? user.profile_picture : "./images/nav/default-user.png";
                            const tag1 = post.tags[0] ? post.tags[0] : "None";
                            const tag2 = post.tags[1] ? post.tags[1] : "None";
                            const div = document.createElement("div");
                            div.classList.add("mt-10", "bg-slate-100", "p-2", "rounded-md");

                            div.innerHTML = `
                            <div class="flex justify-between">
                                <div class="flex items-center gap-3 mb-2">
                                    <img src="${user_img}" alt="User Avatar"
                                        class="w-10 h-10 object-cover rounded-full border border-slate-400">
                                    <div>
                                        <p class="text-sm font-medium text-black">${user_name} ${verified}</p>
                                        <p class="text-xs text-slate-500">${post.created_at.slice(0, 10)} • <i
                                                class="fa-solid fa-earth-americas"></i>
                                        </p>
                                    </div>
                                </div>
                                <div class="dropdown dropdown-end">
                                    <div tabindex="0" role="button" class="btn m-1 text-xl bg-slate-100 border-none rounded-full"><i class="fa-solid fa-ellipsis"></i></div>
                                    <ul tabindex="0" class="menu dropdown-content bg-slate-200 rounded-md z-[1] w-52 p-2 shadow-xl">
                                        <li onclick="bookmarkPost('${post.slug}')"><a><i class="fa-solid fa-bookmark"></i> Save to Bookmark</a></li>
                                        <li onclick="copyPostLink('${post.slug}')"><a><i class="fa-solid fa-link"></i> Copy Link</a></li>
                                        <li onclick="editPost('${post.slug}')"><a><i class="fa-solid fa-pen"></i> Edit Post</a></li>
                                        <li onclick="deletePost('${post.slug}')"><a><i class="fa-solid fa-trash"></i> Delete Post</a></li>
                                    </ul>
                                </div>
                            </div>
        
        
                            <div class="cursor-pointer" onclick="redirectToSinglePost('${post.slug}')">
                                <div class="flex justify-between">
                                    <h1 class="text-2xl font-bold text-slate-900 leading-snug mb-3 hover:underline cursor-pointer">${post.title}</h1>
                                    <div class="w-40 md:w-52 flex-shrink-0">
                                        <img src="${post_img}" alt="Blog Image"
                                            class="w-full h-auto rounded-lg object-cover">
                                    </div>
                                </div>
        
                                <div class="mt-2 flex gap-2">
                                    <span
                                        class="text-xs font-semibold px-3 py-1 bg-slate-200 text-slate-800 rounded-full cursor-pointer">${tag1}</span>
                                    <span
                                        class="text-xs font-semibold px-3 py-1 bg-slate-200 text-slate-800 rounded-full cursor-pointer">${tag2}</span>
                                </div>
        
                                <div class="mt-4 flex justify-between items-center text-slate-600">
                                    <p class="flex items-center gap-3 text-lg">
                                        <span class="flex items-center gap-1 tooltip" data-tip="Like"><i
                                                class="fa-solid fa-thumbs-up"></i> ${post.like_count}</span>
                                        <span class="flex items-center gap-1 tooltip" data-tip="Comments"><i
                                                class="fa-solid fa-comment"></i> ${post.comment_count}</span>
                                    </p>
                                </div>
                            </div>
                        `;
                            parent.appendChild(div);
                        });
                    }
                });
        });

};

const copyPostLink = (slug) => {
    const url = `http://127.0.0.1:5500/single_post.html?slug=${slug}`;

    navigator.clipboard.writeText(url)
        .then(() => {
            alert("Post link copied to clipboard!");
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
                alert(data.success);
            } else if (data.error) {
                alert(data.error);
            }
        });
};

const redirectToSinglePost = (slug) => {
    const url = `http://127.0.0.1:5500/single_post.html?slug=${slug}`;
    window.location.href = url;
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
            alert(data.success);
        } else {
            alert(data.error || "Something went wrong!");
        }

    } catch (error) {
        console.error("Error deleting post:", error);
        alert("Failed to delete the post. Please try again!");
    }
};

const editPost = (slug) => {
    window.location.href = `create_post.html?mode=editing&post=${slug}`;
};


profileView();