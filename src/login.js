const getValue = (id) => {
    const value = document.getElementById(id).value;
    return value;
};

const handleLogin = (event, un=null, up=null) => {
    event.preventDefault();

    let username = getValue("login-username");
    let password = getValue("login-password");

    if (un && up){
        username = un;
        password = up;
    }

    const info = { username, password };

    document.getElementById("login-btn").innerHTML = `<span class="loading loading-spinner loading-xs"></span>`;

    fetch("https://aspire-thought-backend.vercel.app/user/login/", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(info),
    })
        .then(res => res.json())
        .then(data => {
            if (data.token && data.user_id) {
                document.getElementById("login-error-message").innerText = "";
                localStorage.setItem("token", data.token);
                localStorage.setItem("user_id", data.user_id);
                window.location.href = "./profile.html";
            }
            else {
                document.getElementById("login-error-message").innerText = "Invalid username or password!";
            }
            document.getElementById("login-btn").innerHTML = `Login`;
        });
};


const defaultCredential = (event) =>{
    handleLogin(event, "anis97", "ertsS43r$");
};
