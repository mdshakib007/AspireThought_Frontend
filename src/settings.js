const getValue = (id) => {
    const value = document.getElementById(id).value;
    return value;
};

const loadUserInformation = () =>{
    user_id = localStorage.getItem("user_id")

    if(!user_id){
        window.location.href = "./login.html";
    }

    fetch(`http://127.0.0.1:8000/user/list/?user_id=${user_id}`)
    .then(res => res.json())
    .then(data => {
        if(data.length > 0){
            user = data[0];
            console.log(user);
            document.getElementById("username").innerText = user.username;
            document.getElementById("first-name").innerText = user.first_name;
            document.getElementById("last-name").innerText = user.last_name;
            document.getElementById("email").innerText = user.email;
            document.getElementById("phone").innerText = user.phone;
            document.getElementById("date-of-birth").innerText = user.date_of_birth;
        } else{
            window.location.href = "./login.html";
        }
    })
};

loadUserInformation();