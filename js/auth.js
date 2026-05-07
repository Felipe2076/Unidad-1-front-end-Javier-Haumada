const API_BASE_URL = "http://localhost:3000/api";
const defaultUsers = [];
const demoUserEmails = [
    "user1@sportclub.cl",
    "user2@sportclub.cl",
    "coach1@sportclub.cl",
    "coach2@sportclub.cl",
    "admin1@sportclub.cl",
    "admin2@sportclub.cl"
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
        return;
    }

    const cleanedUsers = getUsers().filter(function (user) {
        return !demoUserEmails.includes(normalizeEmail(user.user));
    });
    saveUsers(cleanedUsers);
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

async function apiRequest(endpoint, payload) {
    const url = `${API_BASE_URL}${endpoint}`;
    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
    });

    const contentType = response.headers.get("content-type") || "";
    const data = contentType.includes("application/json") ? await response.json() : null;

    if (!response.ok) {
        const error = data && data.error ? data.error : `Error ${response.status}`;
        throw new Error(error);
    }

    return data;
}

async function tryFetchLogin(email, password) {
    try {
        const result = await apiRequest("/auth/login", { email, password });
        return { success: true, user: result.user };
    } catch (error) {
        if (error instanceof TypeError || error.message.includes("Failed to fetch")) {
            return { success: false, fallback: true, error: error.message };
        }
        return { success: false, error: error.message };
    }
}

async function tryFetchRegister(payload) {
    try {
        const result = await apiRequest("/auth/register", payload);
        return { success: true, user: result.user };
    } catch (error) {
        if (error instanceof TypeError || error.message.includes("Failed to fetch")) {
            return { success: false, fallback: true, error: error.message };
        }
        return { success: false, error: error.message };
    }
}

function performLocalLogin(inputEmail, inputPassword, messageElement) {
    const users = getUsers();
    if (!inputEmail || !inputPassword) {
        setMessage(messageElement, "Debes completar correo y contraseña.", "message-error");
        return null;
    }

    const matchedUser = users.find(function (currentUser) {
        return normalizeEmail(currentUser.user) === inputEmail && currentUser.password === inputPassword;
    });

    if (!matchedUser) {
        setMessage(messageElement, "Credenciales incorrectas.", "message-error");
        return null;
    }

    return {
        name: matchedUser.name,
        user: normalizeEmail(matchedUser.user),
        role: matchedUser.role
    };
}

function performLocalRegister(payload, messageElement) {
    const users = getUsers();
    const alreadyExists = users.some(function (currentUser) {
        return normalizeEmail(currentUser.user) === payload.email;
    });

    if (!payload.email || !payload.password) {
        setMessage(messageElement, "Completa correo y contraseña para registrarte.", "message-error");
        return null;
    }

    if (payload.password.length < 8) {
        setMessage(messageElement, "La contraseña debe tener al menos 8 caracteres.", "message-error");
        return null;
    }

    if (alreadyExists) {
        setMessage(messageElement, "Ese correo ya está registrado. Intenta iniciar sesión.", "message-error");
        return null;
    }

    const newUser = {
        name: payload.name || "Nuevo usuario",
        user: payload.email,
        password: payload.password,
        role: "user"
    };

    users.push(newUser);
    saveUsers(users);

    return {
        name: newUser.name,
        user: newUser.user,
        role: newUser.role
    };
}

function saveSessionUser(sessionUser) {
    localStorage.setItem("user", JSON.stringify(sessionUser));
}

function redirectToDashboard(role) {
    window.location.href = roleRedirects[role] || "login.html";
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

    form.addEventListener("submit", async function (event) {
        event.preventDefault();

        const inputEmail = normalizeEmail(emailInput.value);
        const inputPassword = String(passwordInput.value || "");

        if (!inputEmail || !inputPassword) {
            setMessage(messageElement, "Debes completar correo y contraseña.", "message-error");
            return;
        }

        const apiResult = await tryFetchLogin(inputEmail, inputPassword);

        if (apiResult.success && apiResult.user) {
            const sessionUser = {
                name: apiResult.user.name,
                user: normalizeEmail(apiResult.user.user),
                role: apiResult.user.role
            };
            saveSessionUser(sessionUser);
            setMessage(messageElement, `Bienvenido ${sessionUser.name}. Redirigiendo...`, "message-success");
            window.setTimeout(function () {
                redirectToDashboard(sessionUser.role);
            }, 500);
            return;
        }

        if (apiResult.fallback) {
            const sessionUser = performLocalLogin(inputEmail, inputPassword, messageElement);
            if (!sessionUser) {
                return;
            }
            saveSessionUser(sessionUser);
            setMessage(messageElement, `Bienvenido ${sessionUser.name}. Redirigiendo...`, "message-success");
            window.setTimeout(function () {
                redirectToDashboard(sessionUser.role);
            }, 500);
            return;
        }

        setMessage(messageElement, apiResult.error || "Ocurrió un error al iniciar sesión.", "message-error");
    });

    [emailInput, passwordInput].forEach(function (input) {
        if (!input) return;
        input.addEventListener("input", function () {
            clearMessage(messageElement);
        });
    });
}

function handleRegisterPage() {
    const form = document.querySelector("#register-form");
    if (!form) return;

    const emailInput = document.querySelector("#email");
    const passwordInput = document.querySelector("#password");
    const nameInput = document.querySelector("#name");
    const ageInput = document.querySelector("#age");
    const practiceDeporteInput = document.querySelector("#practiceDeporte");
    const typeDeporteInput = document.querySelector("#typeDeporte");
    const objectivePersonalInput = document.querySelector("#objectivePersonal");
    const levelInput = document.querySelector("#level");
    const infoAdicionalInput = document.querySelector("#infoAdicional");
    const messageElement = document.querySelector("#register-message");

    form.addEventListener("submit", async function (event) {
        event.preventDefault();

        const payload = {
            email: normalizeEmail(emailInput.value),
            password: String(passwordInput.value || "").trim(),
            name: String(nameInput.value || "").trim(),
            age: ageInput.value ? Number(ageInput.value) : null,
            practiceDeporte: practiceDeporteInput ? practiceDeporteInput.checked : false,
            typeDeporte: String(typeDeporteInput.value || "").trim(),
            objectivePersonal: String(objectivePersonalInput.value || "").trim(),
            level: String(levelInput.value || "").trim(),
            infoAdicional: String(infoAdicionalInput.value || "").trim()
        };

        if (!payload.email || !payload.password) {
            setMessage(messageElement, "Completa correo y contraseña para registrarte.", "message-error");
            return;
        }

        if (payload.password.length < 8) {
            setMessage(messageElement, "La contraseña debe tener al menos 8 caracteres.", "message-error");
            return;
        }

        const apiResult = await tryFetchRegister(payload);

        if (apiResult.success && apiResult.user) {
            const sessionUser = {
                name: apiResult.user.name,
                user: normalizeEmail(apiResult.user.user),
                role: apiResult.user.role
            };
            saveSessionUser(sessionUser);
            setMessage(messageElement, "Cuenta creada correctamente. Redirigiendo...", "message-success");
            window.setTimeout(function () {
                redirectToDashboard(sessionUser.role);
            }, 700);
            return;
        }

        if (apiResult.fallback) {
            const sessionUser = performLocalRegister(payload, messageElement);
            if (!sessionUser) {
                return;
            }
            saveSessionUser(sessionUser);
            setMessage(messageElement, "Cuenta creada correctamente. Redirigiendo...", "message-success");
            window.setTimeout(function () {
                redirectToDashboard(sessionUser.role);
            }, 700);
            return;
        }

        setMessage(messageElement, apiResult.error || "Ocurrió un error al registrarte.", "message-error");
    });

    [emailInput, passwordInput, nameInput, ageInput, practiceDeporteInput, typeDeporteInput, objectivePersonalInput, levelInput, infoAdicionalInput].forEach(function (input) {
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
