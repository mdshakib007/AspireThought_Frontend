const displayTags = () => {
    const user_id = localStorage.getItem("user_id");
    const token = localStorage.getItem("token");
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


const createPost = async (event) => {
    event.preventDefault();

    const user_id = localStorage.getItem("user_id");
    const token = localStorage.getItem("token");

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