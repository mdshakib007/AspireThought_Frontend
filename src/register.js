const getValue = (id) => {
    const value = document.getElementById(id).value;
    return value;
};

const handleRegister = (event) => {
    event.preventDefault();
    
    const username = getValue("username");
    const email = getValue("email");
    const password = getValue("password");
    info = { username, email, password };

    document.getElementById("error-message").innerText = "";
    document.getElementById("register-btn").innerHTML = `<span class="loading loading-spinner loading-xs"></span>`;
    document.getElementById("register-success").innerText = "";

    if (password.length >= 8) {
        fetch("http://127.0.0.1:8000/user/register/", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify(info),
        })
            .then(res => res.json())
            .then(data => {
                if (data.username) {
                    document.getElementById("error-message").innerText = data.username;
                } else if (data.Error) {
                    document.getElementById("error-message").innerText = data.Error;
                } else if (data.error) {
                    document.getElementById("error-message").innerText = data.error;
                } else if (data.success) {
                    document.getElementById("register-success").innerText = data.success;
                } else {
                    document.getElementById("error-message").innerText = "Something went wrong!";
                }
                document.getElementById("register-btn").innerHTML = `Register`;
            });
    } else {
        document.getElementById("error-message").innerText = "Password must be at least 8 character.";
        document.getElementById("register-btn").innerHTML = `Register`;
    }
};