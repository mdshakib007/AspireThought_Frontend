const params = new URLSearchParams(window.location.search);
const story = params.get('story');
const page = params.get('page');
const chapter = params.get('chapter')
const postSection = document.getElementById("post-section");
const skeleton = document.getElementById("skeleton-lazy");
const token = localStorage.getItem("token");
const user_id = localStorage.getItem("user_id");

const showSkeleton = () => {
    skeleton.style.display = "flex";
    postSection.innerHTML = "";
};

const hideSkeleton = () => {
    skeleton.style.display = "none";
};

const displayPost = (post) => {
    document.getElementById("post-page-title").innerText = post.title;

    fetch(`https://aspirethought-backend.onrender.com/user/list/?user_id=${post.author}`)
        .then(res => res.json())
        .then(userData => {
            hideSkeleton();
            if (userData.length > 0) {
                const author = userData[0];

                const author_name = author.first_name ? author.first_name : author.username;
                const verified = author.is_verified ? `<span class="tooltip" data-tip="Verified Author"><i class="fa-solid fa-circle-check text-blue-600"></i></span>` : "";
                const author_image = author.profile_picture ? author.profile_picture : "./images/nav/default-user.png";
                const postBodyHtml = marked.parse(post.body);

                postSection.innerHTML = `
                <div class="flex justify-between border-b border-slate-300 items-center">
                    <div class="flex items-center gap-3 pb-4">
                        <img onclick="visitAuthorProfile('${author.id}')" src="${author_image}" alt="User Avatar"
                            class="w-10 h-10 object-cover rounded-full border border-slate-400 cursor-pointer">
                        <div>
                            <p onclick="visitAuthorProfile('${author.id}')" class="text-sm font-medium text-black cursor-pointer">${author_name} ${verified}</p>
                            <p class="text-xs text-slate-500">${post.created_at.slice(0, 10)} • <i class="fa-solid fa-earth-americas"></i></p>
                        </div>
                    </div>
                    <div class="tooltip" data-tip="Total Reads"><i class="fa-solid fa-book-open"></i> ${post.views}</div>
                </div>

                <div class="mt-4">
                    <h1 class="text-4xl font-bold text-slate-900 leading-snug mb-5">${post.title}</h1>
                    <div class="prose mb-6 leading-relaxed text-lg">${postBodyHtml}</div>
                </div>

                <div class="mt-6 flex justify-between items-center text-slate-600 border-t border-b border-slate-300 py-2 px-4">
                    <p class="flex items-center gap-2 text-xl">
                        <span onclick="likePost('${post.slug}')" class="flex items-center gap-1 tooltip cursor-pointer" data-tip="Like"><i class="fa-solid fa-thumbs-up"></i> ${post.like_count}</span>
                    </p>
                    <p class="flex items-center gap-2 text-lg">
                        <span onclick="copyPostLink('${post.slug}')" class="cursor-pointer tooltip ml-4" data-tip="Copy Link"><i class="fa-solid fa-link"></i></span>
                    </p>
                </div>

                <div class="mt-6 flex justify-between">
                    <button onclick="navigatePage('prev')" class="btn bg-slate-500 hover:bg-slate-600 text-white rounded-lg ${prevPage ? '' : 'opacity-50 cursor-not-allowed'}" ${prevPage ? '' : 'disabled'}>
                        <i class="fa-solid fa-arrow-left"></i> Previous
                    </button>
                    <button onclick="navigatePage('next')" class="btn bg-slate-500 hover:bg-slate-600 text-white rounded-lg ${nextPage ? '' : 'opacity-50 cursor-not-allowed'}" ${nextPage ? '' : 'disabled'}>
                        Next <i class="fa-solid fa-arrow-right"></i>
                    </button>
                </div>

                <div id="single-post-comment-section" class="mt-6">
                    <form onsubmit="postComment(event)">
                        <textarea id="comment-input" class="textarea textarea-bordered w-full" name="write-comment" id="write-comment"
                            placeholder="Write a Comment" required></textarea>
                        <button class="btn bg-slate-500 hover:bg-slate-600 text-white mt-2">Comment <i
                                class="fa-solid fa-location-arrow"></i></button>
                    </form>
                </div>`;

                fetch(`https://aspirethought-backend.onrender.com/blog/${post.slug}/comments/`)
                    .then(res => res.json())
                    .then(comments => {
                        document.getElementById("comment-count").innerText = `All Comments (${comments.length})`;
                        const commentSection = document.getElementById("comment-section");
                        if (comments.length > 0) {
                            comments.forEach(comment => {
                                fetch(`https://aspirethought-backend.onrender.com/user/list/?username=${comment.user}`)
                                    .then(res => res.json())
                                    .then(commenterData => {
                                        if (commenterData.length > 0) {
                                            const commenter = commenterData[0];
                                            const full_name = commenter.first_name ? commenter.first_name : commenter.username;
                                            const profile_img = commenter.profile_picture ? commenter.profile_picture : "./images/nav/default-user.png";
                                            const div = document.createElement("div");
                                            div.classList.add("mt-8");
                                            div.innerHTML = `
                                                <div class="border-b border-slate-200 pb-4 mb-6">
                                                    <div class="flex items-center gap-3 mb-2">
                                                        <img src="${profile_img}" alt="User Avatar"
                                                            class="w-10 h-10 object-cover rounded-full border border-slate-400">
                                                            <div>
                                                                <p class="text-sm font-medium text-black">${full_name}</p>
                                                                <p class="text-xs text-slate-500">${comment.created_at.slice(0, 10)}</p>
                                                            </div>
                                                    </div>
                                                    <p class="text-md">${comment.content}</p>
                                                </div>`;

                                            commentSection.appendChild(div);
                                        }
                                    });

                            });
                        } else {
                            commentSection.innerHTML = `<p class="text-center my-5 font-bold text-xl">Be the first to comment <i class="fa-solid fa-comment-dots"></i></p>`;
                        }
                    });

            } else {
                postSection.innerHTML = "Unexpected Error Occurred!";
            }
        });
};

const navigatePage = (direction) => {
    let currentPage = parseInt(page) || 1;
    if (direction === "next" && nextPage) {
        window.location.href = `read_story.html?story=${story}&chapter=${chapter}&page=${currentPage + 1}`;
    } else if (direction === "prev" && prevPage) {
        window.location.href = `read_story.html?story=${story}&chapter=${chapter}&page=${currentPage - 1}`;
    }
};

let nextPage = null;
let prevPage = null;

const fetchPost = () => {
    showSkeleton();

    if (!story) {
        console.error("No slug found in URL!");
        hideSkeleton();
        postSection.innerHTML = "Unexpected Error Occurred!";
    } else {
        fetch(`https://aspirethought-backend.onrender.com/blog/stories/${story}/chapters/?page=${page}`)
            .then(res => res.json())
            .then(data => {
                if (data.results.length > 0) {
                    nextPage = data.next;
                    prevPage = data.previous;
                    displayPost(data.results[0]);
                } else {
                    hideSkeleton();
                    postSection.innerHTML = "Unexpected Error Occurred!";
                }
            })
            .catch(error => console.error("Error fetching post:", error));
    }
};


const postComment = function (event) {
    event.preventDefault();

    const content = document.getElementById("comment-input").value;

    if (!token || !user_id) {
        window.location.href = "login.html";
    }

    fetch(`https://aspirethought-backend.onrender.com/blog/${chapter}/comments/add/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Token ${token}`,
        },
        body: JSON.stringify({ content: content })
    })
        .then(response => response.json().then(data => ({ data, response })))
        .then(({ data, response }) => {
            if (response.ok) {
                window.location.href = `read_story.html?story=${story}&chapter=${chapter}&page=${page}`
            } else {
                Toastify({
                    text: `session expired, please login again.`,
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
        .catch(error => console.error("Network error:", error));
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


const copyPostLink = (slug) => {
    const url = `https://mdshakib007.github.io/AspireThought_Frontend/read_story.html?story=${story}&chapter=${chapter}&page=${page}`;

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

fetchPost();