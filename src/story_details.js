const user_id = localStorage.getItem("user_id");
const token = localStorage.getItem("token");
const params = new URLSearchParams(window.location.search);
const story_slug = params.get("story");

const loadStoryDetails = async () => {
    if (!story_slug) {
        window.location.href = "index.html";
    }

    const storyRes = await fetch(`https://aspirethought-backend.onrender.com/blog/stories/${story_slug}`);
    const storyData = await storyRes.json()

    // all the variable of story
    const storyName = storyData.name;
    const storyImage = storyData.cover;
    const authorId = storyData.author;
    const summary = storyData.summary;
    const tags = storyData.tags;
    const created = storyData.created_at;
    const chapters = storyData.chapters;

    const userRes = await fetch(`https://aspirethought-backend.onrender.com/user/list/?user_id=${authorId}`);
    const userData = await userRes.json()
    const author = userData[0]

    // all veriable for user
    const authroName = author.first_name ? author.first_name : author.username;
    const authorImage = author.profile_picture ? author.profile_picture : "./images/nav/default-user.png";
    const verified = author.is_verified ? `<span class="tooltip" data-tip="Verified Author"><i class="fa-solid fa-circle-check text-blue-600"></i></span>` : "";

    if(user_id && token && user_id == authorId){
        document.getElementById("add-new-chapter-btn").classList.remove("hidden");
    }

    document.getElementById("story-name").innerText = storyName;
    document.getElementById("story-summary").innerText = summary;
    document.getElementById("published-data").innerText = created.slice(0, 10);
    document.getElementById("author-name").innerHTML = `${authroName} ${verified}`;
    document.getElementById("author-name-2").innerHTML = `${authroName} ${verified}`;
    document.getElementById("chapter-count").innerHTML = `<i class="fa-solid fa-inbox"></i> ${chapters.length} Chapters`;
    document.getElementById("story-cover-image").src = storyImage;
    document.getElementById("author-image").src = authorImage;

    tags.forEach(tag => {
        const tagParent = document.getElementById("story-tags");
        const tagChild = document.createElement("a");
        tagChild.href = `tag_results.html?tag=${tag}`;
        tagChild.classList.add("p-2", "border", "rounded-lg");
        tagChild.innerText = tag;
        tagParent.appendChild(tagChild);
    })

    const chapterContainer = document.getElementById("story-chapter-section");
    let pageCount = 0;
    chapters.forEach(chapter => {
        pageCount++;
        const div = document.createElement("div");
        div.classList.add("bg-white", "rounded-lg", "p-2", "mt-4");
        div.innerHTML = `
            <div onclick="redirectToSinglePost('${story_slug}', '${chapter.slug}', ${pageCount})" class="cursor-pointer">
                <h1 class="text-md sm:text-xl md:text-2xl font-bold text-slate-900 leading-snug mb-3 hover:underline">${chapter.title}</h1>
                <p>${chapter.body.slice(0, 300)}...</p>
            </div>

            <div class="mt-2 flex justify-between items-center text-slate-600 border-t border-slate-300 pt-2">
                <p class="flex items-center gap-5 text-xl">
                    <span onclick="likePost('${chapter.slug}')" class="flex items-center gap-1 tooltip cursor-pointer" data-tip="Like"><i class="fa-solid fa-thumbs-up"></i> ${chapter.like_count}</span>
                    <span onclick="redirectToSinglePost('${story_slug}', '${chapter.slug}', ${pageCount})" class="flex items-center gap-1 tooltip cursor-pointer" data-tip="Comments"><i class="fa-solid fa-comment"></i> ${chapter.comment_count}</span>
                </p>
                <p class="flex items-center gap-5 text-xl">
                    <span class="cursor-pointer tooltip" data-tip="Total Reads"><i class="fa-solid fa-book-open"></i> ${chapter.views}</span>
                </p>
            </div>
        `;
        chapterContainer.appendChild(div);
    })
};

const addToLibrary = () => {
    if (!token || !user_id) {
        window.location.href = "login.html";
        return;
    }

    fetch("https://aspirethought-backend.onrender.com/user/library/add/", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Token ${token}`,
        },
        body: JSON.stringify({ "slug": story_slug }),
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

async function redirectToSinglePost(story_slug, slug, page_count) {
    try {
        await fetch(`https://aspirethought-backend.onrender.com/blog/${slug}/view/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ "slug": slug }),
        });

        window.location.href = `read_story.html?story=${encodeURIComponent(story_slug)}&chapter=${slug}&page=${page_count}`;
    } catch (error) {
        console.error("Error increasing view count:", error);
        window.location.href = `read_story.html?story=${encodeURIComponent(story_slug)}&chapter=${slug}&page=${page_count}`;
    }
}

const redirectToCreateChapterd = () => {
    window.location.href = `write_chapter.html?story=${story_slug}`;
};

loadStoryDetails();