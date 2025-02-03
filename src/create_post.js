const params = new URLSearchParams(window.location.search);
const mode = params.get('mode');
const post_slug = params.get('post');
const user_id = localStorage.getItem("user_id");
const token = localStorage.getItem("token");

const displayTags = () => {
    if (!user_id || !token) {
        window.location.href = "login.html";
        return;
    }

    fetch("http://127.0.0.1:8000/tag/list/")
        .then(res => res.json())
        .then(data => {
            const parent = document.getElementById("tag-list-div");
            const select1 = document.createElement("select");
            const select2 = document.createElement("select");
            select1.classList.add("select", "select-bordered", "w-full", "max-w-xs");
            select2.classList.add("select", "select-bordered", "w-full", "max-w-xs");
            select1.id = "select-tag-input-1";
            select2.id = "select-tag-input-2";

            const option1 = document.createElement("option");
            option1.textContent = "--Type or Select Tag--";
            option1.value = "None";
            select1.appendChild(option1);

            const option2 = document.createElement("option");
            option2.textContent = "--Type or Select Tag--";
            option2.value = "None";
            select2.appendChild(option2);

            data.forEach(tag => {
                const option1 = document.createElement("option");
                const option2 = document.createElement("option");

                option1.textContent = tag.name;
                option1.value = tag.slug;
                select1.appendChild(option1);

                option2.textContent = tag.name;
                option2.value = tag.slug;
                select2.appendChild(option2);
            });

            parent.appendChild(select1);
            parent.appendChild(select2);
        });
};

const displayForEditing = async () => {
    if (!mode || !post_slug) return;

    try {
        const res = await fetch(`http://127.0.0.1:8000/blog/list/?post_slug=${post_slug}`);
        const data = await res.json();

        if (data.results.length > 0) {
            const post = data.results[0];

            document.getElementById("title-input").value = post.title;
            document.getElementById("title-input").readOnly = true;
            editor.setMarkdown(post.body);

            if (post.image) {
                const imgPreview = document.createElement("img");
                imgPreview.src = post.image;
                imgPreview.alt = "Current Cover Image";
                imgPreview.classList.add("w-full", "max-h-60", "object-cover", "mt-3", "rounded-lg");
                document.getElementById("cover-image").insertAdjacentElement("afterend", imgPreview);
            }

            setTimeout(() => {
                document.getElementById("select-tag-input-1").value = post.tags[0] || "None";
                document.getElementById("select-tag-input-2").value = post.tags[1] || "None";
            }, 500);
        } else {
            alert("Post not found!");
        }
    } catch (error) {
        console.error("Error fetching post data:", error);
    }
};


const editPost = async (event) => {
    event.preventDefault();

    if (!user_id || !token) {
        window.location.href = "login.html";
        return;
    }

    const title = document.getElementById("title-input").value;
    const cover_image = document.getElementById("cover-image").files[0];
    const markdown_body = editor.getMarkdown();
    const select_tag1 = document.getElementById("select-tag-input-1").value;
    const select_tag2 = document.getElementById("select-tag-input-2").value;

    if (markdown_body.length < 20) {
        document.getElementById("editor-error-msg").innerText = "Post body must contain at least 20 characters.";
        return;
    }

    let tags = [];
    if (select_tag1 !== "None") tags.push(select_tag1);
    if (select_tag2 !== "None") tags.push(select_tag2);

    const formData = new FormData();
    formData.append("slug", post_slug); // Slug is required for identifying the post

    if (title) formData.append("title", title);
    if (cover_image) formData.append("image", cover_image);
    if (markdown_body) formData.append("body", markdown_body);
    tags.forEach(tag => formData.append("tags", tag));

    try {
        const response = await fetch("http://127.0.0.1:8000/blog/edit/", {
            method: "POST",
            headers: {
                "Authorization": `Token ${token}`,
            },
            body: formData,
        });

        const data = await response.json();
        if (data.success) {
            alert("Post updated successfully!");
            window.location.href = "profile.html";
        } else {
            console.log(data);
            alert("Failed to update post!");
        }
    } catch (error) {
        console.error("Error updating post:", error);
    }
};


const createPost = async (event) => {
    event.preventDefault();

    if (!user_id || !token) {
        window.location.href = "login.html";
        return;
    }

    const title = document.getElementById("title-input").value;
    const cover_image = document.getElementById("cover-image").files[0];
    const markdown_body = editor.getMarkdown();
    const select_tag1 = document.getElementById("select-tag-input-1").value;
    const select_tag2 = document.getElementById("select-tag-input-2").value;

    if (markdown_body.length < 20) {
        document.getElementById("editor-error-msg").innerText = "Post body must contains at least 20 characters.";
        return;
    }

    let tags = [];
    if (select_tag1 != "None") tags.push(select_tag1);
    if (select_tag2 > "None") tags.push(select_tag2);

    const formData = new FormData();
    formData.append("title", title);
    if (cover_image) formData.append("image", cover_image);
    formData.append("body", markdown_body);
    tags.forEach(tag => formData.append("tags", tag));

    try {
        const postResponse = await fetch("http://127.0.0.1:8000/blog/create/", {
            method: "POST",
            headers: {
                "Authorization": `Token ${token}`,
            },
            body: formData,
        });

        const postData = await postResponse.json();
        if (postData.success) {
            window.location.href = "index.html";
        } else {
            console.log(postData);
            alert("Failed to create post!");
        }
    } catch (error) {
        console.error("Post creating error:", error);
    }
};

displayTags();
displayForEditing();