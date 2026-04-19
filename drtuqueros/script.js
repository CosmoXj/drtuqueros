document.addEventListener("DOMContentLoaded", () => {
    updateUIBasedOnSession();
    if (window.location.pathname.includes("cart.html")) {
        renderCart();
    }
});

// ===== MENU TOGGLE (class-based, works on both mobile and desktop) =====
function menutoggle() {
    var MenuItems = document.getElementById("MenuItems");
    if (MenuItems) {
        MenuItems.classList.toggle("open");
    }
}

// Close menu when a link is clicked (mobile UX)
document.addEventListener("DOMContentLoaded", () => {
    var links = document.querySelectorAll("#MenuItems li a");
    links.forEach(function(link) {
        link.addEventListener("click", function() {
            var MenuItems = document.getElementById("MenuItems");
            if (MenuItems) MenuItems.classList.remove("open");
        });
    });
});

// ===== AUTH / ACCOUNT =====
function updateUIBasedOnSession() {
    var activeUser = localStorage.getItem("activeUser");
    var profileView = document.getElementById("ProfileView");
    var authBox = document.getElementById("AuthBox");
    var formContainer = document.querySelector(".form-container");

    if (activeUser && profileView && authBox) {
        profileView.style.display = "block";
        authBox.style.display = "none";

        if (formContainer) {
            formContainer.style.height = "auto";
            formContainer.style.paddingBottom = "30px";
        }

        var users = JSON.parse(localStorage.getItem("db_users")) || [];
        var userData = users.find(function(u) { return u.username === activeUser; });

        if (userData) {
            var profUser = document.getElementById("prof-user");
            var profEmail = document.getElementById("prof-email");
            if (profUser) profUser.innerText = userData.username;
            if (profEmail) profEmail.innerText = userData.email;
        }
    }
}

function logout() {
    localStorage.removeItem("activeUser");
    alert("You have been logged out!");
    window.location.reload();
}

// ===== LOGIN / REGISTER FORM TABS =====
var LoginForm = document.getElementById("LoginForm");
var RegForm = document.getElementById("RegForm");
var Indicator = document.getElementById("Indicator");

function register() {
    if (RegForm && LoginForm && Indicator) {
        RegForm.style.transform = "translateX(-300px)";
        LoginForm.style.transform = "translateX(-300px)";
        Indicator.style.transform = "translateX(100px)";
    }
}

function login() {
    if (RegForm && LoginForm && Indicator) {
        RegForm.style.transform = "translateX(0px)";
        LoginForm.style.transform = "translateX(0px)";
        Indicator.style.transform = "translateX(0px)";
    }
}

if (RegForm) {
    RegForm.addEventListener("submit", function(e) {
        e.preventDefault();
        var inputs = RegForm.querySelectorAll("input");
        var newUser = {
            username: inputs[0].value.trim(),
            email: inputs[1].value.trim(),
            password: inputs[2].value
        };

        var users = JSON.parse(localStorage.getItem("db_users")) || [];
        if (users.find(function(u) { return u.username === newUser.username; })) {
            return alert("Username is already taken!");
        }

        users.push(newUser);
        localStorage.setItem("db_users", JSON.stringify(users));
        alert("Account created! Please log in.");
        login();
    });
}

if (LoginForm) {
    LoginForm.addEventListener("submit", function(e) {
        e.preventDefault();
        var inputs = LoginForm.querySelectorAll("input");
        var user = inputs[0].value.trim();
        var pass = inputs[1].value;

        var users = JSON.parse(localStorage.getItem("db_users")) || [];
        var valid = users.find(function(u) { return u.username === user && u.password === pass; });

        if (valid) {
            localStorage.setItem("activeUser", user);
            alert("Login successful! Welcome, " + user);
            window.location.reload();
        } else {
            alert("Incorrect username or password.");
        }
    });
}

// ===== CART HELPERS =====
function getCartKey() {
    var user = localStorage.getItem("activeUser") || "guest";
    return "cart_" + user;
}

// ===== ADD TO CART =====
var addBtn = document.querySelector(".add-to-cart-btn");
if (addBtn) {
    addBtn.addEventListener("click", function(e) {
        e.preventDefault();
        var container = document.querySelector(".single-product");
        if (!container) return;

        var nameEl = container.querySelector("h1");
        var priceEl = container.querySelector("h4");
        var imgEl = container.querySelector("img");
        var sizeEl = container.querySelector("select");
        var qtyEl = container.querySelector("input[type='number']");

        if (!nameEl || !priceEl || !imgEl || !sizeEl || !qtyEl) return;

        var item = {
            name: nameEl.innerText,
            price: parseFloat(priceEl.innerText.replace("$", "")),
            img: imgEl.getAttribute("src"),
            size: sizeEl.value,
            qty: parseInt(qtyEl.value) || 1
        };

        if (item.size === "Select Size") {
            return alert("Please select a size first.");
        }

        var key = getCartKey();
        var cart = JSON.parse(localStorage.getItem(key)) || [];
        var existing = cart.find(function(i) { return i.name === item.name && i.size === item.size; });

        if (existing) {
            existing.qty += item.qty;
        } else {
            cart.push(item);
        }

        localStorage.setItem(key, JSON.stringify(cart));
        alert(item.name + " added to your cart!");
        window.location.href = "cart.html";
    });
}

// ===== RENDER CART =====
function renderCart() {
    var table = document.getElementById("CartTable");
    if (!table) return;

    var key = getCartKey();
    var cart = JSON.parse(localStorage.getItem(key)) || [];

    table.innerHTML = "<tr><th>Product</th><th>Quantity</th><th>Subtotal</th></tr>";

    if (cart.length === 0) {
        table.innerHTML += "<tr><td colspan='3' style='text-align:center; padding:30px; color:#999;'>Your cart is empty.</td></tr>";
    }

    var subtotalValue = 0;

    cart.forEach(function(item, index) {
        var lineTotal = item.price * item.qty;
        subtotalValue += lineTotal;
        table.innerHTML += "<tr>" +
            "<td><div class='cart-info'>" +
            "<img src='" + item.img + "' alt='" + item.name + "'>" +
            "<div><p>" + item.name + "</p>" +
            "<small>Size: " + item.size + " | $" + item.price.toFixed(2) + "</small><br>" +
            "<a href='javascript:void(0)' onclick='removeItem(" + index + ")'>Remove</a>" +
            "</div></div></td>" +
            "<td><input type='number' value='" + item.qty + "' min='1' onchange='updateQty(" + index + ", this.value)'></td>" +
            "<td>$" + lineTotal.toFixed(2) + "</td>" +
            "</tr>";
    });

    var tax = subtotalValue * 0.12;
    var grandTotal = subtotalValue + tax;

    var totalsTable = document.querySelector(".total-price table");
    if (totalsTable) {
        totalsTable.innerHTML =
            "<tr><td>Subtotal</td><td>$" + subtotalValue.toFixed(2) + "</td></tr>" +
            "<tr><td>Tax (12% VAT)</td><td>$" + tax.toFixed(2) + "</td></tr>" +
            "<tr><td><strong>Total</strong></td><td><strong>$" + grandTotal.toFixed(2) + "</strong></td></tr>";
    }
}

window.removeItem = function(index) {
    var cart = JSON.parse(localStorage.getItem(getCartKey())) || [];
    cart.splice(index, 1);
    localStorage.setItem(getCartKey(), JSON.stringify(cart));
    renderCart();
};

window.updateQty = function(index, val) {
    var cart = JSON.parse(localStorage.getItem(getCartKey())) || [];
    cart[index].qty = parseInt(val) || 1;
    localStorage.setItem(getCartKey(), JSON.stringify(cart));
    renderCart();
};

// ===== CONTACT FORM =====
var ContactForm = document.getElementById("ContactForm");
if (ContactForm) {
    ContactForm.addEventListener("submit", function(e) {
        e.preventDefault();
        alert("Message sent! We'll get back to you soon.");
        ContactForm.reset();
    });
}
