const params = new URLSearchParams(window.location.search);
const story = encodeURIComponent(params.get('story'));
const mode = encodeURIComponent(params.get('mode'));
const user_id = localStorage.getItem("user_id");
const token = localStorage.getItem("token");

const postChapter = async (event) => {
    event.preventDefault();

    if (!user_id || !token) {
        window.location.href = "login.html";
        return;
    }


    const title = document.getElementById("chapter-title-input").value;
    const markdown_body = editor.getMarkdown();

    if (markdown_body.length < 100) {
        document.getElementById("editor-error-msg").innerText = "Chapter content must contains at least 100 characters.";
        return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("body", markdown_body);

    try {
        const postResponse = await fetch(`https://aspirethought-backend.onrender.com/blog/stories/${story}/chapters/create/`, {
            method: "POST",
            headers: {
                "Authorization": `Token ${token}`,
            },
            body: formData,
        });

        const postData = await postResponse.json();
        if (postData.success) {
            window.location.href = `story_details.html?story=${story}`;
        } else {
            Toastify({
                text: `${postData.error ? postData.error : "Failed to create post!"}`,
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

const editChapter = (event) => {
    event.preventDefault();
};