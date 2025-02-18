const user_id = localStorage.getItem("user_id");
const token = localStorage.getItem("token");

const displayInfo = async () => {
    if (!user_id || !token) {
        window.location.href = "login.html";
        return;
    }

    const dashboardRes = await fetch(`https://aspire-thought-backend.vercel.app/user/dashboard/`, {
        method: "GET",
        headers: {
            "Authorization": `Token ${token}`,
        }
    })
    const dashboardData = await dashboardRes.json();

    const likes = dashboardData.likes;
    const comments = dashboardData.comments;
    const chapters = dashboardData.chapters;
    const views = dashboardData.post_views + dashboardData.story_views;
    const posts = dashboardData.posts;
    const stories = dashboardData.stories;
    const engagementScore = dashboardData.top_content.engagement_score;
    const mostViewedPost = dashboardData.most_viewed_post;
    const topContent = dashboardData.top_content.content;
    const author_id = mostViewedPost.author;
    const tag1 = mostViewedPost.tags[0] ? mostViewedPost.tags[0] : null;
    const tag2 = mostViewedPost.tags[1] ? mostViewedPost.tags[1] : null;
    const post_img = mostViewedPost.image ? mostViewedPost.image : null;

    const authorRes = await fetch(`https://aspire-thought-backend.vercel.app/user/list/?user_id=${author_id}`)
    const authorData = await authorRes.json();
    const author = authorData[0];
    const author_img = author.profile_picture ? author.profile_picture : "./images/nav/default-user.png";
    const user_name = author.first_name ? author.first_name : author.username;
    const verified = author.is_verified ? `<span class="tooltip" data-tip="Verified Author"><i class="fa-solid fa-circle-check text-blue-600"></i></span>` : "";

    document.getElementById("like-count").innerText = likes;
    document.getElementById("read-count").innerText = views;
    document.getElementById("engagement-score").innerText = engagementScore;
    document.getElementById("comment-count").innerText = comments;
    document.getElementById("post-count").innerText = posts;
    document.getElementById("story-count").innerText = stories;
    document.getElementById("chapter-count").innerHTML = `↘︎ ${chapters} Chapters`;
    document.getElementById("author-img").src = author_img;

    document.getElementById("most-viewed-post").innerHTML = `
    <h1 class="text-2xl mb-5 text-green-500">Most Viewed Post<h1>
    <div class="flex items-center gap-3 mb-2">
        <img src="${author_img}" alt="User Avatar"
            class="w-10 h-10 object-cover rounded-full border border-slate-400 cursor-pointer">
        <div>
            <p class="text-sm font-medium text-black cursor-pointer">${user_name} ${verified}</p>
            <p class="text-xs text-slate-500">${mostViewedPost.created_at.slice(0, 10)} • <i
                    class="fa-solid fa-earth-americas"></i>
            </p>
        </div>
    </div>

    <div class="">
        <div onclick="redirectToSinglePost('${mostViewedPost.slug}')" class="flex justify-between cursor-pointer">
            <h1 class="text-md sm:text-xl md:text-2xl font-bold text-slate-900 leading-snug mb-3 hover:underline cursor-pointer">${mostViewedPost.title}</h1>
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
                <span onclick="likePost('${mostViewedPost.slug}')" class="flex items-center gap-1 tooltip cursor-pointer" data-tip="Like"><i
                        class="fa-solid fa-thumbs-up"></i> ${mostViewedPost.like_count}</span>
                <span onclick="redirectToSinglePost('${mostViewedPost.slug}')" class="flex items-center gap-1 tooltip cursor-pointer" data-tip="Comments"><i
                        class="fa-solid fa-comment"></i> ${mostViewedPost.comment_count}</span>
            </p>
            <p class="tooltip" data-tip="Total Views"><i class="fa-solid fa-eye"></i> ${mostViewedPost.views}</p>
        </div>
    </div>
    `;
            console.log(topContent);
    document.getElementById("top-content").innerHTML = `
        <h1 class="text-2xl mb-5 text-green-500">Top Content<h1>
    <div class="flex items-center gap-3 mb-2">
        <img src="${author_img}" alt="User Avatar"
            class="w-10 h-10 object-cover rounded-full border border-slate-400 cursor-pointer">
        <div>
            <p class="text-sm font-medium text-black cursor-pointer">${user_name} ${verified}</p>
            <p class="text-xs text-slate-500">${topContent.created_at.slice(0, 10)} • <i
                    class="fa-solid fa-earth-americas"></i>
            </p>
        </div>
    </div>

    <div class="">
        <div onclick="redirectToSinglePost('${topContent.slug}')" class="flex justify-between cursor-pointer">
            <h1 class="text-md sm:text-xl md:text-2xl font-bold text-slate-900 leading-snug mb-3 hover:underline cursor-pointer">${topContent.title}</h1>
            ${topContent.image ? `
                <div class="w-32 md:w-52 flex-shrink-0">
                    <img src="${topContent.image}" alt="Blog Image"
                    class="w-full h-auto rounded-lg object-cover">
                </div>
            ` : ""}
            
        </div>

        <div class="mt-2 flex gap-2">
            ${topContent.tags[0] ? `<span onclick="tagResults('${topContent.tags[0]}')" 
                class="text-xs font-semibold px-3 py-1 bg-slate-200 text-slate-800 rounded-full cursor-pointer">${topContent.tags[0]}</span>` : ""}
            ${topContent.tags[1] ? `<span onclick="tagResults('${topContent.tags[1]}')" 
                class="text-xs font-semibold px-3 py-1 bg-slate-200 text-slate-800 rounded-full cursor-pointer">${topContent.tags[1]}</span>` : ""}
        </div>

        <div class="mt-2 pt-2 flex justify-between items-center text-slate-600 border-t border-slate-300">
            <p class="flex items-center gap-5 text-xl">
                <span onclick="likePost('${topContent.slug}')" class="flex items-center gap-1 tooltip cursor-pointer" data-tip="Like"><i
                        class="fa-solid fa-thumbs-up"></i> ${topContent.like_count}</span>
                <span onclick="redirectToSinglePost('${topContent.slug}')" class="flex items-center gap-1 tooltip cursor-pointer" data-tip="Comments"><i
                        class="fa-solid fa-comment"></i> ${topContent.comment_count}</span>
            </p>
            <p class="tooltip" data-tip="Total Views"><i class="fa-solid fa-eye"></i> ${topContent.views}</p>
        </div>
    </div>
    `;
};

const tagResults = (tag_slug) => {
    if (tag_slug != "None")
        window.location.href = `tag_results.html?tag=${tag_slug}`;
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

displayInfo();