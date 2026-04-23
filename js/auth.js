const defaultUsers = [
    { name: "Usuario Uno", user: "user1@sportclub.cl", password: "1234", role: "user" },
    { name: "Usuario Dos", user: "user2@sportclub.cl", password: "1234", role: "user" },
    { name: "Coach Uno", user: "coach1@sportclub.cl", password: "1234", role: "coach" },
    { name: "Coach Dos", user: "coach2@sportclub.cl", password: "1234", role: "coach" },
    { name: "Admin Uno", user: "admin1@sportclub.cl", password: "1234", role: "admin" },
    { name: "Admin Dos", user: "admin2@sportclub.cl", password: "1234", role: "admin" }
];

const USERS_STORAGE_KEY = "sportclub_users";

const roleRedirects = {
    user: "dashboard_usuario.html",
    coach: "dashboard_coach.html",
    admin: "dashboard_admin.html"
};

function normalizeEmail(value) {
    return String(value || "").trim().toLowerCase();
}

function getLoggedUser() {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
        return null;
    }

    try {
        return JSON.parse(storedUser);
    } catch (error) {
        localStorage.removeItem("user");
        return null;
    }
}

function getUsers() {
    const storedUsers = localStorage.getItem(USERS_STORAGE_KEY);
    if (!storedUsers) {
        return defaultUsers.slice();
    }

    try {
        const parsed = JSON.parse(storedUsers);
        return Array.isArray(parsed) ? parsed : defaultUsers.slice();
    } catch (error) {
        return defaultUsers.slice();
    }
}

function saveUsers(usersList) {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(usersList));
}

function initializeUsersStore() {
    if (!localStorage.getItem(USERS_STORAGE_KEY)) {
        saveUsers(defaultUsers);
    }
}

function setMessage(messageElement, text, type) {
    if (!messageElement) return;
    messageElement.textContent = text;
    messageElement.className = `message ${type}`;
}

function clearMessage(messageElement) {
    if (!messageElement) return;
    messageElement.textContent = "";
    messageElement.className = "message is-hidden";
}

function handleLoginPage() {
    const form = document.querySelector("#login-form");
    if (!form) return;

    const loggedUser = getLoggedUser();
    if (loggedUser && roleRedirects[loggedUser.role]) {
        window.location.href = roleRedirects[loggedUser.role];
        return;
    }

    const emailInput = document.querySelector("#email");
    const passwordInput = document.querySelector("#password");
    const messageElement = document.querySelector("#login-message");

    form.addEventListener("submit", function (event) {
        event.preventDefault();

        const inputEmail = normalizeEmail(emailInput.value);
        const inputPassword = String(passwordInput.value || "");
        const users = getUsers();

        if (!inputEmail || !inputPassword) {
            setMessage(messageElement, "Debes completar correo y contraseña.", "message-error");
            return;
        }

        const matchedUser = users.find(function (currentUser) {
            return normalizeEmail(currentUser.user) === inputEmail && currentUser.password === inputPassword;
        });

        if (!matchedUser) {
            setMessage(messageElement, "Credenciales incorrectas.", "message-error");
            return;
        }

        const sessionUser = {
            name: matchedUser.name,
            user: normalizeEmail(matchedUser.user),
            role: matchedUser.role
        };

        localStorage.setItem("user", JSON.stringify(sessionUser));
        setMessage(messageElement, `Bienvenido ${sessionUser.name}. Redirigiendo...`, "message-success");
        window.setTimeout(function () {
            window.location.href = roleRedirects[sessionUser.role];
        }, 500);
    });

    emailInput.addEventListener("input", function () {
        clearMessage(messageElement);
    });

    passwordInput.addEventListener("input", function () {
        clearMessage(messageElement);
    });
}

function handleRegisterPage() {
    const form = document.querySelector("#register-form");
    if (!form) return;

    const emailInput = document.querySelector("#email");
    const passwordInput = document.querySelector("#password");
    const nameInput = document.querySelector("#name");
    const messageElement = document.querySelector("#register-message");

    form.addEventListener("submit", function (event) {
        event.preventDefault();

        const email = normalizeEmail(emailInput.value);
        const password = String(passwordInput.value || "").trim();
        const name = String(nameInput.value || "").trim();
        const users = getUsers();

        if (!email || !password) {
            setMessage(messageElement, "Completa correo y contraseña para registrarte.", "message-error");
            return;
        }

        if (password.length < 4) {
            setMessage(messageElement, "La contraseña debe tener al menos 4 caracteres.", "message-error");
            return;
        }

        const alreadyExists = users.some(function (currentUser) {
            return normalizeEmail(currentUser.user) === email;
        });

        if (alreadyExists) {
            setMessage(messageElement, "Ese correo ya está registrado. Intenta iniciar sesión.", "message-error");
            return;
        }

        const newUser = {
            name: name || "Nuevo usuario",
            user: email,
            password: password,
            role: "user"
        };

        users.push(newUser);
        saveUsers(users);

        const sessionUser = {
            name: newUser.name,
            user: newUser.user,
            role: newUser.role
        };

        localStorage.setItem("user", JSON.stringify(sessionUser));
        setMessage(messageElement, "Cuenta creada correctamente. Redirigiendo...", "message-success");

        window.setTimeout(function () {
            window.location.href = roleRedirects.user;
        }, 700);
    });

    [emailInput, passwordInput, nameInput].forEach(function (input) {
        if (!input) return;
        input.addEventListener("input", function () {
            clearMessage(messageElement);
        });
    });
}

function handleDashboardPage() {
    const requiredRole = document.body.dataset.requiredRole;
    if (!requiredRole) return;

    const loggedUser = getLoggedUser();
    if (!loggedUser || loggedUser.role !== requiredRole) {
        window.location.href = "login.html";
        return;
    }

    document.querySelectorAll("[data-user-name]").forEach(function (element) {
        element.textContent = loggedUser.name;
    });

    document.querySelectorAll("[data-user-email]").forEach(function (element) {
        element.textContent = loggedUser.user;
    });

    document.querySelectorAll("[data-logout]").forEach(function (button) {
        button.addEventListener("click", function (event) {
            event.preventDefault();
            localStorage.removeItem("user");
            window.location.href = "login.html";
        });
    });
}

document.addEventListener("DOMContentLoaded", function () {
    initializeUsersStore();
    handleLoginPage();
    handleRegisterPage();
    handleDashboardPage();
});
