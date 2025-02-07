const user_id = localStorage.getItem("user_id");
const token = localStorage.getItem("token");

const getValue = (id) => {
    const value = document.getElementById(id).value;
    return value;
};

const loadUserInformation = () => {
    if (!user_id || !token) {
        window.location.href = "./login.html";
    }

    fetch(`https://aspirethought-backend.onrender.com/user/list/?user_id=${user_id}`)
        .then(res => res.json())
        .then(data => {
            if (data.length > 0) {
                const user = data[0];
                if (user.profile_picture) {
                    document.getElementById("profile-picture").src = user.profile_picture;
                } else {
                    document.getElementById("profile-picture").src = "./images/nav/default-user.png";
                }
                document.getElementById("username").innerHTML = user.is_verified ? ` ${user.username} <i class="fa-solid fa-circle-check text-blue-600"></i>` : ` ${user.username}`;
                document.getElementById("full-name").innerHTML = ` ${user.first_name} ${user.last_name}`;
                document.getElementById("email").innerHTML = ` ${user.email}`;
                document.getElementById("phone").innerHTML = ` ${user.phone_number}`;
                document.getElementById("date-of-birth").innerHTML = ` ${user.date_of_birth}`;
                document.getElementById("verification-author-name").innerHTML = user.first_name ? `${user.first_name} <i class="fa-solid fa-circle-check text-blue-600"></i>` : `${user.username} <i class="fa-solid fa-circle-check text-blue-600"></i>`;
                if (user.profile_picture)
                    document.getElementById("verify-profile-picture").src = user.profile_picture;

                if (user.verification_requested && !user.is_verified) {
                    document.getElementById("verification-pending-author").style.display = "block";
                    document.getElementById("not-verified-author").style.display = "none";
                    document.getElementById("verified-author").style.display = "none";
                }
                if (user.is_verified) {
                    document.getElementById("verification-pending-author").style.display = "none";
                    document.getElementById("not-verified-author").style.display = "none";
                    document.getElementById("verified-author").style.display = "block";
                }
                if (!user.verification_requested && !user.is_verified) {
                    document.getElementById("verification-pending-author").style.display = "none";
                    document.getElementById("not-verified-author").style.display = "block";
                    document.getElementById("verified-author").style.display = "none";
                }
            } else {
                alert("session expired. please login again.");
                window.location.href = "./login.html";
            }
        })
};

const followingTopicList = () => {
    if(!user_id || !token){
        return;
    }

    fetch(`https://aspirethought-backend.onrender.com/user/list/?user_id=${user_id}`)
    .then(res => res.json())
    .then(data => {
        if(data.length > 0){
            const parent = document.getElementById("following-topic-list");
            data[0].following.forEach(topic => {
                tr = document.createElement("tr");
                tr.innerHTML = `
                    <td><a href="tag_results.html?tag=${topic}"><i class="fa-solid fa-tag"></i> ${topic}</a></td>
                    <td><button onclick="unfollowTopic('${topic}')" class="btn btn-sm btn-outline hover:bg-slate-600 rounded-full">Unfollow</button></td>
                `;
                parent.appendChild(tr);
            });
        } else {
            alert("session expired. please login again.");
            window.location.href = "./login.html";
        }
    });
};

const unfollowTopic = (topic) => {

};

const requestForVerification = () => {
    if (!user_id || !token) {
        alert("An error occurred!");
        return;
    }

    fetch("https://aspirethought-backend.onrender.com/user/request-verification/", {
        method: "POST",
        headers: {
            "Authorization": `Token ${token}`,
        },
    })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                window.location.href = "settings.html";
            } else {
                alert(data.error ? data.error : "Unexpected error occurred!");
            }
        });
};

const openUpdateModal = (title, id) => {
    document.getElementById("universal-modal-title").innerText = title;
    document.getElementById("universal-modal-input-label").innerText = title;
    document.getElementById("universal-modal-input").placeholder = title;

    if (id === "date-of-birth") {
        document.getElementById("universal-modal-input").type = "date";
    } else if (id == "profile-picture") {
        document.getElementById("universal-modal-input").type = "file";
        document.getElementById("universal-modal-input").accept = "image/*";
        document.getElementById("universal-modal-input").classList.add("file-input");
    } else {
        document.getElementById("universal-modal-input").type = "text";
    }

    document.getElementById("universal_modal").setAttribute("requested_id", id);
    document.getElementById("universal_modal").showModal();
};

const updateUserInformation = (event) => {
    event.preventDefault();
    
    const id = document.getElementById("universal_modal").getAttribute("requested_id");
    const updatedValue = document.getElementById("universal-modal-input").value;

    if (!updatedValue) {
        alert("Please fill out the input field!");
        return;
    }

    let title = "";
    if (id === "full-name") {
        title = "first_name";
    } else if (id === "username") {
        title = "username";
    } else if (id === "phone") {
        title = "phone_number";
    } else if (id === "date-of-birth") {
        title = "date_of_birth";
    } else if (id === "profile-picture") {
        title = "profile_picture";
    }

    const formData = new FormData();
    if (id === "profile-picture") {
        const fileInput = document.getElementById("universal-modal-input");
        if (!fileInput || fileInput.files.length === 0) {
            alert("No file selected for profile picture update.");
            return;
        }
        formData.append(title, fileInput.files[0]);
    } else {
        formData.append(title, updatedValue);
    }

    fetch("https://aspirethought-backend.onrender.com/user/update/", {
        method: "POST",
        headers: {
            "Authorization": `Token ${token}`,
        },
        body: formData,
    })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                window.location.href = "settings.html";
            } else {
                document.getElementById("form-error-field").innerText = "An Error Occurred";
            }
        })
        .catch(error => console.error("Update failed:", error));
};

loadUserInformation();
followingTopicList();