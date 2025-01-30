const profileView = () => {
    const token = localStorage.getItem("token");
    const user_id = localStorage.getItem("user_id");

    if (!token || !user_id) {
        window.location.href = "./login.html";
        return;
    }

    fetch(`http://127.0.0.1:8000/user/list/?user_id=${user_id}`)
        .then(res => res.json())
        .then(data => {
            if (!data[0]) {
                window.location.href = "login.html";
            }
            user = data[0];
            if (user.profile_picture) {
                document.getElementById("profile-profile-picture").src = user.profile_picture;
            }
            document.getElementById("profile-username").innerText = user.username;
            document.getElementById("profile-email").innerText = user.email;

            if(user.first_name){
                document.getElementById("profile-full-name").innerHTML = `${user.first_name} ${user.last_name}`;
            } else{
                document.getElementById("profile-full-name").innerHTML = "Unknown";
            }
            if(user.phone_number){
                document.getElementById("profile-phone").innerText = user.phone_number;
            } else{
                document.getElementById("profile-phone").innerText = "Unknown";
            }
            if(user.date_of_birth){
                document.getElementById("profile-date-of-birth").innerText = user.date_of_birth;
            } else{
                document.getElementById("profile-date-of-birth").innerText = "Unknown";
            }

        });
};

profileView();