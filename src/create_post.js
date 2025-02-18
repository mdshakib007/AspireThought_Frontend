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

    fetch("https://aspire-thought-backend.vercel.app/tag/list/")
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
        const res = await fetch(`https://aspire-thought-backend.vercel.app/blog/list/?post_slug=${post_slug}`);
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
            Toastify({
                text: `post not found`,
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

    let img_url = null;
    if (cover_image) {
        const imageForm = new FormData();
        imageForm.append("image", cover_image);
        try {
            const imgResponse = await fetch("https://api.imgbb.com/1/upload?key=a1628c9dacce3ab8a8de3488c32afc47", {
                method: "POST",
                body: imageForm,
            });

            const imgData = await imgResponse.json();

            if (imgData.success) {
                img_url = imgData.data.display_url;
            } else {
                Toastify({
                    text: `Image upload failed.`,
                    duration: 3000,
                    offset: { x: 10, y: 50 },
                    style: { background: "#22c55e" }
                }).showToast();
                return;
            }
        } catch (error) {
            console.error("Image upload error:", error);
            Toastify({
                text: `Failed to upload image.`,
                duration: 3000,
                offset: { x: 10, y: 50 },
                style: { background: "#22c55e" }
            }).showToast();
            return;
        }
    }

    let info = { "slug": post_slug };
    if (img_url) info.image = img_url;
    if (markdown_body) info.body = markdown_body;
    if (tags.length > 0) info.tags = tags;

    try {
        const response = await fetch("https://aspire-thought-backend.vercel.app/blog/edit/", {
            method: "POST",
            headers: {
                "Authorization": `Token ${token}`,
                "content-type": "application/json",
            },
            body: JSON.stringify(info),
        });

        const data = await response.json();
        if (data.success) {
            window.location.href = "profile.html";
        } else {
            Toastify({
                text: `Faild to update post`,
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

    let img_url = null;
    if (cover_image) {
        const imageForm = new FormData();
        imageForm.append("image", cover_image);
        try {
            const imgResponse = await fetch("https://api.imgbb.com/1/upload?key=a1628c9dacce3ab8a8de3488c32afc47", {
                method: "POST",
                body: imageForm,
            });

            const imgData = await imgResponse.json();

            if (imgData.success) {
                img_url = imgData.data.display_url;
            } else {
                Toastify({
                    text: `Image upload failed.`,
                    duration: 3000,
                    offset: { x: 10, y: 50 },
                    style: { background: "#22c55e" }
                }).showToast();
                return;
            }
        } catch (error) {
            console.error("Image upload error:", error);
            Toastify({
                text: `Failed to upload image.`,
                duration: 3000,
                offset: { x: 10, y: 50 },
                style: { background: "#22c55e" }
            }).showToast();
            return;
        }
    }
    
    let info = {slug : post_slug};
    if (title) info.title = title;
    if (img_url) info.image = img_url;
    if(markdown_body) info.body = markdown_body;
    if(tags.length > 0) info.tags = tags;

    try {
        const postResponse = await fetch("https://aspire-thought-backend.vercel.app/blog/create/", {
            method: "POST",
            headers: {
                "Authorization": `Token ${token}`,
                "content-type": "application/json",
            },
            body: JSON.stringify(info),
        });

        const postData = await postResponse.json();
        if (postData.success) {
            window.location.href = "index.html";
        } else {
            Toastify({
                text: `Faild to create post`,
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
        console.error("Post creating error:", error);
    }
};

displayTags();
displayForEditing();