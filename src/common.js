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
    const token = localStorage.getItem("token");
    const user_id = localStorage.getItem("user_id");

    if (!token || !user_id) {
        window.location.href = "./login.html"
        return;
    };

    const info = { token, user_id };
    fetch("https://juicycart-tropicals.onrender.com/user/logout/", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(info),
    })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                localStorage.removeItem("token");
                localStorage.removeItem("user_id");
                window.location.href = "./login.html";
            } else {
                console.error("Logout failed:", data);
                alert("Logout failed. Please try again.");
            }
        })
        .catch(error => {
            console.error("Error during logout:", error);
        });
};


loadComponent('navbar.html', 'nav-component', );
loadComponent('footer.html', 'footer-component');