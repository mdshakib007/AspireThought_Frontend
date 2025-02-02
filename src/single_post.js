const params = new URLSearchParams(window.location.search);
const slug = params.get('slug');
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

const setPostTitle = (title) => {
    document.getElementById("post-page-title").innerText = title;
};

const setAuthorDetails = (author) => {
    const author_name = author.first_name ? author.first_name : author.username;
    const author_image = author.profile_picture ? author.profile_picture : "./images/nav/default-user.png";
    return { author_name, author_image };
};

const setPostBody = (post) => {
    const postBodyHtml = marked.parse(post.body);
    return postBodyHtml;
};

const setTags = (tags) => {
    const tag1 = tags[0] ? tags[0] : "None";
    const tag2 = tags[1] ? tags[1] : "None";
    return { tag1, tag2 };
};

const setPostDetails = (post) => {
    const { author_name, author_image } = setAuthorDetails(post.author);
    const postBodyHtml = setPostBody(post);
    const { tag1, tag2 } = setTags(post.tags);

    postSection.innerHTML = `
        <div class="flex items-center gap-3 mb-4 border-b border-slate-300 pb-4">
            <img src="${author_image}" alt="User Avatar" class="w-10 h-10 object-cover rounded-full border border-slate-400">
            <div>
                <p class="text-sm font-medium text-black">${author_name}</p>
                <p class="text-xs text-slate-500">${post.created_at.slice(0, 10)} • <i class="fa-solid fa-earth-americas"></i></p>
            </div>
        </div>
        <div>
            <h1 class="text-4xl font-bold text-slate-900 leading-snug mb-5">${post.title}</h1>
            <img src="${post.image}" alt="blog img" class="my-5 w-full">
            <div class="prose mb-6 leading-relaxed">${postBodyHtml}</div>
        </div>
        <div class="mt-4 flex gap-2">
            <span class="text-xs font-semibold px-3 py-1 bg-slate-200 text-slate-800 rounded-full cursor-pointer">${tag1}</span>
            <span class="text-xs font-semibold px-3 py-1 bg-slate-200 text-slate-800 rounded-full cursor-pointer">${tag2}</span>
        </div>
        <div class="mt-6 flex justify-between items-center text-slate-600 border-t border-b border-slate-300 py-2 px-4">
            <p class="flex items-center gap-2 text-xl">
                <span onclick="likePost(event)" class="flex items-center gap-1 tooltip" data-tip="Like"><i class="fa-solid fa-thumbs-up"></i> ${post.like_count}</span>
            </p>
            <p class="flex items-center gap-2 text-lg">
                <span onclick="bookmarkPost(event)" class="cursor-pointer tooltip" data-tip="Bookmark"><i class="fa-solid fa-bookmark"></i></span>
                <span class="cursor-pointer tooltip ml-4" data-tip="More"><i class="fa-solid fa-ellipsis"></i></span>
            </p>
        </div>
        <div class="mt-6">
            <form onsubmit="postComment(event)">
                <textarea id="comment-input" class="textarea textarea-bordered w-full" name="write-comment" id="write-comment"
                    placeholder="Write a Comment" required></textarea>
                <button class="btn bg-slate-500 hover:bg-slate-600 text-white mt-2">Comment <i class="fa-solid fa-location-arrow"></i></button>
            </form>
        </div>
    `;
};

const setCommentCount = (count) => {
    document.getElementById("comment-count").innerText = `All Comments (${count})`;
};

const renderComments = (comments) => {
    const commentSection = document.getElementById("comment-section");
    if (comments.length > 0) {
        comments.forEach(comment => {
            fetchCommenterData(comment.user)
                .then(commenterData => {
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
                        </div>
                    `;
                    commentSection.appendChild(div);
                });
        });
    } else {
        commentSection.innerHTML = `<p class="text-center my-5 font-bold text-xl">Be the first to comment <i class="fa-solid fa-comment-dots"></i></p>`;
    }
};

const fetchCommenterData = (username) => {
    return fetch(`http://127.0.0.1:8000/user/list/?username=${username}`)
        .then(res => res.json());
};

const fetchPostData = () => {
    showSkeleton();

    if (!slug) {
        console.error("No slug found in URL!");
        hideSkeleton();
        postSection.innerHTML = "Unexpected Error Occurred!";
    } else {
        fetch(`http://127.0.0.1:8000/blog/list/?post_slug=${slug}`)
            .then(res => res.json())
            .then(data => {
                if (data.results.length > 0) {
                    displayPost(data.results[0]);
                } else {
                    hideSkeleton();
                    postSection.innerHTML = "Unexpected Error Occurred!";
                }
            })
            .catch(error => console.error("Error fetching post:", error));
    }
};

const displayPost = (post) => {
    setPostTitle(post.title);
    fetchUserData(post.author)
        .then(userData => {
            hideSkeleton();
            if (userData.length > 0) {
                setPostDetails(post);
                fetchComments(post.slug);
            } else {
                postSection.innerHTML = "Unexpected Error Occurred!";
            }
        });
};

const fetchUserData = (authorId) => {
    return fetch(`http://127.0.0.1:8000/user/list/?user_id=${authorId}`)
        .then(res => res.json());
};

const fetchComments = (slug) => {
    fetch(`http://127.0.0.1:8000/blog/${slug}/comments/`)
        .then(res => res.json())
        .then(comments => {
            setCommentCount(comments.length);
            renderComments(comments);
        });
};

const postComment = (event) => {
    event.preventDefault();

    if(!token || !user_id){
        window.location.href = "login.html";
        return;
    }

    const content = document.getElementById("comment-input").value;

    fetch(`http://127.0.0.1:8000/blog/${slug}/comments/add/`, {
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
                alert("Comment added successfully!");
                window.location.href = `single_post.html?slug=${slug}`;
            } else {
                console.error("Error posting comment:", data);
            }
        })
        .catch(error => console.error("Network error:", error));
};

const likePost = (event) => {
    event.preventDefault();

    if(!token || !user_id){
        window.location.href = "login.html";
        return;
    }

    fetch(`http://127.0.0.1:8000/blog/${slug}/like/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Token ${token}`,
        }
    })
    .then(res => res.json())
    .then(data => {
        if(data.success){
            alert(data.success);
            window.location.href = `single_post.html?slug=${slug}`;
        } else{

        }
    });
};

const bookmarkPost = (event) => {
    event.preventDefault();

    if(!token || !user_id){
        window.location.href = "login.html";
        return;
    }

    fetch("http://127.0.0.1:8000/user/bookmark/add/", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Token ${token}`,
        },
        body : JSON.stringify({"slug" : slug}),
    })
    .then(res => res.json())
    .then(data => {
        if(data.success){
            alert(data.success);
        } else if(data.error){
            alert(data.error);
        }
    });
};

fetchPostData();
