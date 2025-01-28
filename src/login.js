const getValue = (id) => {
    const value = document.getElementById(id).value;
    return value;
};

const handleLogin = (event) => {
    event.preventDefault();

    const username = getValue("login-username");
    const password = getValue("login-password");
    const info = { username, password };

    document.getElementById("login-btn").innerHTML = `<span class="loading loading-spinner loading-xs"></span>`;

    fetch("http://127.0.0.1:8000/user/login/", {
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

const profileView = () => {
    const token = localStorage.getItem("token");
    const user_id = localStorage.getItem("user_id");

    if (!token || !user_id) {
        window.location.href = "./login.html";
        return;
    }

    // Fetch and populate user information
    fetch(`https://juicycart-tropicals.onrender.com/user/list/?user_id=${user_id}`)
        .then((res) => res.json())
        .then((data) => {
            if (data.length > 0) {
                const user = data[0];
                document.getElementById("profile-username").innerText = user.username;
                document.getElementById("profile-email").innerText = user.email;
                document.getElementById("user-fullname").innerText = `${user.first_name} ${user.last_name}`;
                document.getElementById("user-email").innerText = user.email;
            }
        });

    // Fetch and populate seller information
    fetch(`https://juicycart-tropicals.onrender.com/user/seller/list/?user_id=${user_id}`)
        .then((res) => res.json())
        .then((data) => {
            if (data.length > 0) {
                const seller = data[0];
                document.getElementById("seller-info").classList.remove("hidden");
                document.getElementById("seller-shop").classList.remove("hidden");
                document.getElementById("seller-mobile").innerText = seller.mobile_no;
                document.getElementById("seller-address").innerText = seller.full_address;
                document.getElementById("customer-image").classList.add("hidden");
                document.getElementById("seller-image").classList.remove("hidden");
                document.getElementById("seller-image").src = seller.image;

                // Fetch and populate seller's shop information
                fetch(`https://juicycart-tropicals.onrender.com/shop/list/?user_id=${user_id}`)
                    .then(res => res.json())
                    .then(data => {
                        if (data[0]) {
                            shop = data[0];
                            document.getElementById("shop-img").src = shop.image;
                            document.getElementById("shop-name").innerText = shop.name;
                            document.getElementById("shop-location").innerHTML = `<i class="fa-solid fa-location-dot"></i> ${shop.location}`;
                            document.getElementById("shop-hotline").innerHTML = `<i class="fa-solid fa-phone"></i> +${shop.hotline}`;
                            document.getElementById("shop-description").innerText = shop.description;

                        } else {
                            document.getElementById("seller-shop").classList.add("hidden");
                            document.getElementById("create-shop-btn").innerHTML = `
                            <button class="btn bg-orange-500 text-white hover:bg-orange-600" 
                            onclick="showCreateShopModal()">
                                <i class="fa-solid fa-plus"></i> Create Your Own Shop
                            </button>`
                        }
                    });
            }
        });

    // Fetch and populate customer information
    fetch(`https://juicycart-tropicals.onrender.com/user/customer/list/?user_id=${user_id}`)
        .then((res) => res.json())
        .then((data) => {
            if (data.length > 0) {
                const customer = data[0];
                document.getElementById("customer-info").classList.remove("hidden");
                document.getElementById("customer-address").innerText = customer.full_address;
                document.getElementById("account-balance").innerText = `$${customer.balance}`;
                document.getElementById("seller-image").classList.add("hidden");
                document.getElementById("customer-image").classList.remove("hidden");
                document.getElementById("customer-image").src = customer.image;
            }
        });

    // Fetch and populate customer orders information
    fetch(`https://juicycart-tropicals.onrender.com/order/list/?customer_id=${user_id}`)
        .then((res) => res.json())
        .then((data) => {
            if (data.length > 0) {
                document.getElementById("customer-orders").classList.remove("hidden");
                data.forEach((order) => {
                    const parent = document.getElementById("order-table");
                    const tr = document.createElement("tr");
                    tr.classList.add("hover");
                    tr.innerHTML = `
                    <th>${order.created_at.slice(0, 10)}</th>
                    <td>X${order.quantity}</td>
                    <td>$${order.total_price}</td>
                    <td>${order.status}</td>
                    <td>
                        <button 
                            class="btn btn-sm bg-orange-500 text-white hover:bg-orange-600" 
                            onclick="showOrderDetails(${order.id})">
                            Details
                        </button>
                    </td>
                `;
                    parent.appendChild(tr);
                });
            }
        });


};
