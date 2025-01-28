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

    fetch("http://127.0.0.1:8000/user/logout/", {
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



loadComponent('navbar.html', 'nav-component',);
loadComponent('footer.html', 'footer-component');