const user_id = localStorage.getItem("user_id");
const token = localStorage.getItem("token");

const displayInit = async () => {
    if (!user_id || !token) {
        return;
    }
    document.getElementById("my-info-section").classList.remove("hidden");

    const myUrl = `https://aspirethought-backend.onrender.com/user/list/?user_id=${user_id}`;
    const myStoriesUrl = `https://aspirethought-backend.onrender.com/blog/stories/?author_id=${user_id}`;

    const myResponse = await fetch(myUrl);
    const me = await myResponse.json();
    if (me.length < 1) {
        Toastify({
            text: `Session expired, please login again`,
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

    const myStoryRes = await fetch(myStoriesUrl);
    const myStories = await myStoryRes.json();
    const myStoriesSection = "my-stories-section";

    if (myStories.results.length < 1) {
        document.getElementById(myStoriesSection).innerHTML = `
            <div class="flex justify-center">
                <button onclick="create_story_modal.showModal()" class="btn bg-transparent hover:bg-green-600 rounded-full border border-black hover:text-white">
                    <i class="fa-solid fa-pen-to-square"></i>
                    Write your first story!
                </button>
            </div>
        `;
    }
    else {
        displayStories(myStories.results, myStoriesSection);
    }

    const myName = me[0].first_name ? me[0].first_name : me[0].username;
    const verified = me[0].is_verified ? `<span class="tooltip" data-tip="Verified Author"><i class="fa-solid fa-circle-check text-blue-600"></i></span>` : "";
    const myEmail = me[0].email;
    const myPic = me[0].profile_picture ? me[0].profile_picture : "./images/nav/default-user.png";

    document.getElementById("my-pic").src = myPic;
    document.getElementById("my-name").innerHTML = `${myName} ${verified}`;
    document.getElementById("my-email").innerText = myEmail;

    const allStoryUrl = `https://aspirethought-backend.onrender.com/blog/stories/`;
    const allStoryRes = await fetch(allStoryUrl);
    const allStories = await allStoryRes.json();
    displayStories(allStories.results, "all-stories-section");

    const tagsRes = await fetch(`https://aspirethought-backend.onrender.com/tag/list/`);
    const tagsData = await tagsRes.json();

    const selectTagsParent = document.getElementById("story-tags-input-div");
    const select = document.createElement("select");
    select.id = "story-tags-input";
    select.multiple = true;
    tagsData.forEach(tagData => {
        const option = document.createElement("option");
        option.value = tagData.slug;
        option.textContent = tagData.name;
        select.appendChild(option);
    });
    selectTagsParent.appendChild(select);
};


const displayStories = (stories, section) => {
    const parent = document.getElementById(section);

    stories.forEach(story => {
        const div = document.createElement("div");
        div.classList.add("max-w-4xl", "bg-slate-50", "p-3", "mb-5");

        fetch(`https://aspirethought-backend.onrender.com/user/list/?user_id=${story.author}`)
            .then(res => res.json())
            .then(userData => {
                if (userData.length > 0) {
                    const user = userData[0];
                    const user_name = user.first_name ? user.first_name : user.username;
                    const verified = user.is_verified ? `<span class="tooltip" data-tip="Verified Author"><i class="fa-solid fa-circle-check text-blue-600"></i></span>` : "";
                    const user_img = user.profile_picture ? user.profile_picture : "./images/nav/default-user.png";

                    div.innerHTML = `
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
    })
};

const redirectToStory = (slug) => {
    window.location.href = `story_details.html?story=${slug}`;
};

const CreateStory = () => {
    if (!user_id || !token) {
        window.location.href = "login.html";
        return;
    }
    document.getElementById("create-story-btn").innerHTML = `<span class="loading loading-spinner loading-xs"></span>`;

    const storyName = document.getElementById("story-name-input").value;
    const storyImageInput = document.getElementById("story-cover-image-input");
    const storyImage = storyImageInput.files[0];
    const tagsSelect = document.getElementById("story-tags-input");
    const selectedTags = Array.from(tagsSelect.selectedOptions).map(option => option.value);
    const summary = document.getElementById("story-summary-input").value;

    if (!storyName || !storyImage || !selectedTags || !summary) {
        Toastify({
            text: `Please fill out all the field`,
            duration: 3000,
            offset: {
                x: 10,
                y: 50
            },
            style: {
                background: "#475569",
            }
        }).showToast();
        document.getElementById("create-story-btn").innerHTML = `Create Story`;
        return;
    }

    const formData = new FormData();
    formData.append("name", storyName);
    formData.append("cover", storyImage);
    formData.append("summary", summary);
    selectedTags.forEach(tag => formData.append("tags", tag));

    fetch(`https://aspirethought-backend.onrender.com/blog/stories/create/`, {
        method: "POST",
        headers: {
            "Authorization": `Token ${token}`,
        },
        body: formData,
    })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                window.location.href = "stories.html";
            } else {
                Toastify({
                    text: `${data.error ? data.error : "Unexpected error occurred."}`,
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
        })
        .catch(error => console.error("Error:", error));
    document.getElementById("create-story-btn").innerHTML = `Create Story`;
};


displayInit();