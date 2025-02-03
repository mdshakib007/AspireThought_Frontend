const loadComponent = async (url, elementId) => {
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Failed to load ${url}: ${response.statusText}`);
        const html = await response.text();
        document.getElementById(elementId).innerHTML = html;
    } catch (error) {
        console.error(`Error loading component:`, error);
    }
};

const handleLogout = (event) => {
    event.preventDefault();

    const token = localStorage.getItem("token");
    const user_id = localStorage.getItem("user_id");

    if (!token || !user_id) {
        window.location.href = "./login.html";
        return;
    }

    fetch("https://aspirethought-backend.onrender.com/user/logout/", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Token ${token}`
        }
    })
        .then((res) => res.json())
        .then((data) => {
            if (data.success) {
                localStorage.removeItem("token");
                localStorage.removeItem("user_id");
                window.location.href = "./login.html";
            } else {
                console.error("Logout failed:", data);
                alert("Logout failed. Please try again.");
            }
        })
        .catch((error) => {
            console.error("Error during logout:", error);
        });
};

const loadNavProfilePicture = () => {
    const user_id = localStorage.getItem("user_id");
    if(!user_id){
        return;
    }

    fetch(`https://aspirethought-backend.onrender.com/user/list/${user_id}`)
    .then(res => res.json())
    .then(data => {
        if(data.username){
            document.getElementById("nav-profile-name").innerText = data.username;
        } else{
            document.getElementById("nav-profile-name").innerText = "Unknown";
        }
        if(data.profile_picture){
            document.getElementById("nav-profile-image-1").src = data.profile_picture;
            document.getElementById("nav-profile-image-2").src = data.profile_picture;
        } else{
            document.getElementById("nav-profile-image-1").src = "../images/nav/default-user.png";
            document.getElementById("nav-profile-image-2").src = "../images/nav/default-user.png";
        }
    })
};


loadComponent('navbar.html', 'nav-component',);
loadComponent('footer.html', 'footer-component');
loadNavProfilePicture();