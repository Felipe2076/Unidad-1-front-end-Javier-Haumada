const API_BASE_URL = "http://localhost:3000/api";
const SESSION_STORAGE_KEY = "sportclub_session";
const USERS_STORAGE_KEY = "sportclub_users";
const defaultUsers = [
    {
        id: 1,
        name: "Usuario Demo",
        firstName: "Usuario",
        lastNamePaternal: "Demo",
        lastNameMaternal: "Sport",
        user: "user1@sportclub.cl",
        role: "user",
        age: 28,
        birthDate: "1995-02-12",
        practiceDeporte: true,
        typeDeporte: "running",
        objectivePersonal: "Mejorar resistencia",
        level: "intermedio",
        healthCondition: "Ninguna",
        infoAdicional: "Ninguna",
        createdAt: "2025-05-10T10:00:00.000Z",
        password: "1234"
    },
    {
        id: 2,
        name: "Coach Demo",
        firstName: "Coach",
        lastNamePaternal: "Demo",
        lastNameMaternal: "Sport",
        user: "coach1@sportclub.cl",
        role: "coach",
        age: 34,
        birthDate: "1990-08-21",
        practiceDeporte: true,
        typeDeporte: "crossfit",
        objectivePersonal: "Guiar a atletas",
        level: "avanzado",
        healthCondition: "Optima",
        infoAdicional: "Coach de fuerza y resistencia.",
        createdAt: "2025-05-10T12:30:00.000Z",
        password: "1234"
    },
    {
        id: 3,
        name: "Admin Demo",
        firstName: "Admin",
        lastNamePaternal: "Demo",
        lastNameMaternal: "Sport",
        user: "admin1@sportclub.cl",
        role: "admin",
        age: 31,
        birthDate: "1992-03-14",
        practiceDeporte: false,
        typeDeporte: "",
        objectivePersonal: "Administrar el club",
        level: "principiante",
        healthCondition: "N/A",
        infoAdicional: "Cuenta de administracion.",
        createdAt: "2025-05-10T14:45:00.000Z",
        password: "1234"
    },
    {
        id: 4,
        name: "Usuario Demo",
        firstName: "Usuario",
        lastNamePaternal: "Demo",
        lastNameMaternal: "Sport",
        user: "usuario1@demo.cl",
        role: "user",
        age: 28,
        birthDate: "1995-02-12",
        practiceDeporte: true,
        typeDeporte: "running",
        objectivePersonal: "Mejorar resistencia",
        level: "intermedio",
        healthCondition: "Ninguna",
        infoAdicional: "Ninguna",
        createdAt: "2025-05-10T10:00:00.000Z",
        password: "12345678"
    },
    {
        id: 5,
        name: "Coach Demo",
        firstName: "Coach",
        lastNamePaternal: "Demo",
        lastNameMaternal: "Sport",
        user: "coach1@demo.cl",
        role: "coach",
        age: 34,
        birthDate: "1990-08-21",
        practiceDeporte: true,
        typeDeporte: "crossfit",
        objectivePersonal: "Guiar a atletas",
        level: "avanzado",
        healthCondition: "Optima",
        infoAdicional: "Coach de fuerza y resistencia.",
        createdAt: "2025-05-10T12:30:00.000Z",
        password: "12345678"
    },
    {
        id: 6,
        name: "Admin Demo",
        firstName: "Admin",
        lastNamePaternal: "Demo",
        lastNameMaternal: "Sport",
        user: "admin1@demo.cl",
        role: "admin",
        age: 31,
        birthDate: "1992-03-14",
        practiceDeporte: false,
        typeDeporte: "",
        objectivePersonal: "Administrar el club",
        level: "principiante",
        healthCondition: "N/A",
        infoAdicional: "Cuenta de administracion.",
        createdAt: "2025-05-10T14:45:00.000Z",
        password: "12345678"
    }
];
const demoUserEmails = [
    "user1@sportclub.cl",
    "coach1@sportclub.cl",
    "admin1@sportclub.cl",
    "usuario1@demo.cl",
    "coach1@demo.cl",
    "admin1@demo.cl"
];

const roleRedirects = {
    user: "dashboard_usuario.html",
    coach: "dashboard_coach.html",
    admin: "dashboard_admin.html"
};

function redirectToDashboard(role) {
    window.location.href = roleRedirects[role] || roleRedirects.user;
}

function normalizeEmail(value) {
    return String(value || "").trim().toLowerCase();
}

function buildFullName(firstName, lastNamePaternal, lastNameMaternal) {
    return [firstName, lastNamePaternal, lastNameMaternal]
        .map(function (value) {
            return String(value || "").trim();
        })
        .filter(Boolean)
        .join(" ");
}

function getSession() {
    const stored = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!stored) {
        return null;
    }

    try {
        return JSON.parse(stored);
    } catch (error) {
        localStorage.removeItem(SESSION_STORAGE_KEY);
        return null;
    }
}

function saveSession(session) {
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
}

function clearSession() {
    localStorage.removeItem(SESSION_STORAGE_KEY);
}

function getLoggedUser() {
    const session = getSession();
    return session && session.user ? session.user : null;
}

function getAuthToken() {
    const session = getSession();
    return session && session.token ? session.token : null;
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

    var stored = getUsers();
    var changed = false;
    defaultUsers.forEach(function (demo) {
        var demoEmail = normalizeEmail(demo.user);
        var match = stored.find(function (u) { return normalizeEmail(u.user) === demoEmail; });
        if (match) {
            if (match.password !== "1234") {
                match.password = "1234";
                match.name = demo.name;
                match.firstName = demo.firstName;
                match.lastNamePaternal = demo.lastNamePaternal;
                match.lastNameMaternal = demo.lastNameMaternal;
                match.healthCondition = demo.healthCondition;
                changed = true;
            }
        } else {
            stored.push(JSON.parse(JSON.stringify(demo)));
            changed = true;
        }
    });
    if (changed) { saveUsers(stored); }
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

function setInputError(inputElement, text) {
    if (!inputElement) return;
    const container = inputElement.closest(".form-group");
    if (!container) return;

    let errorElement = container.querySelector(".input-error");
    if (!errorElement) {
        errorElement = document.createElement("p");
        errorElement.className = "input-error";
        container.appendChild(errorElement);
    }

    errorElement.textContent = text;
    inputElement.classList.add("input-invalid");
}

function clearInputErrors(container) {
    if (!container) return;
    container.querySelectorAll(".input-invalid").forEach(function (input) {
        input.classList.remove("input-invalid");
    });
    container.querySelectorAll(".input-error").forEach(function (element) {
        element.textContent = "";
    });
}

function formatDate(value) {
    if (!value) {
        return "-";
    }

    const date = new Date(value);
    if (Number.isNaN(date.valueOf())) {
        return value;
    }

    return `${String(date.getDate()).padStart(2, "0")}/${String(date.getMonth() + 1).padStart(2, "0")}/${date.getFullYear()}`;
}

function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, function (character) {
        return {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        }[character];
    });
}

async function apiRequest(endpoint, method = "GET", payload = null, requireAuth = false) {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers = {
        "Content-Type": "application/json"
    };

    if (requireAuth) {
        const token = getAuthToken();
        if (token) {
            headers["Authorization"] = `Bearer ${token}`;
        }
    }

    const options = {
        method,
        headers
    };

    if (payload) {
        options.body = JSON.stringify(payload);
    }

    const response = await fetch(url, options);
    const contentType = response.headers.get("content-type") || "";
    const data = contentType.includes("application/json") ? await response.json() : null;

    if (!response.ok) {
        const error = data && data.error ? data.error : `Error ${response.status}`;
        throw new Error(error);
    }

    return data;
}

function isFetchError(error) {
    return error instanceof TypeError || error.message.includes("Failed to fetch");
}

async function tryFetchLogin(email, password) {
    try {
        const result = await apiRequest("/auth/login", "POST", { email, password });
        return { success: true, user: result.user, token: result.token };
    } catch (error) {
        if (isFetchError(error)) {
            return { success: false, fallback: true, error: error.message };
        }
        return { success: false, error: error.message };
    }
}

async function tryFetchRegister(payload) {
    try {
        const result = await apiRequest("/auth/register", "POST", payload);
        return { success: true, user: result.user, token: result.token };
    } catch (error) {
        if (isFetchError(error)) {
            return { success: false, fallback: true, error: error.message };
        }
        return { success: false, error: error.message };
    }
}

async function tryFetchProfile() {
    try {
        const result = await apiRequest("/auth/me", "GET", null, true);
        return { success: true, user: result.user };
    } catch (error) {
        if (isFetchError(error)) {
            return { success: false, fallback: true, error: error.message };
        }
        return { success: false, error: error.message };
    }
}

async function tryUpdateProfile(payload) {
    try {
        const result = await apiRequest("/auth/me", "PUT", payload, true);
        return { success: true, user: result.user };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

async function tryChangePassword(payload) {
    try {
        const result = await apiRequest("/auth/me/password", "PUT", payload, true);
        return { success: true, message: result.message };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

async function tryFetchUsers() {
    try {
        const result = await apiRequest("/users", "GET", null, true);
        return { success: true, users: result.users };
    } catch (error) {
        return { success: false, error: error.message, fallback: isFetchError(error) };
    }
}

async function tryFetchUser(id) {
    try {
        const result = await apiRequest(`/users/${id}`, "GET", null, true);
        return { success: true, user: result.user };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

async function tryCreateUser(payload) {
    try {
        const result = await apiRequest("/users", "POST", payload, true);
        return { success: true, user: result.user };
    } catch (error) {
        if (isFetchError(error)) {
            var localUser = performLocalCreateUser(payload);
            if (localUser) return { success: true, user: localUser };
        }
        return { success: false, error: error.message };
    }
}

async function tryUpdateUser(id, payload) {
    try {
        const result = await apiRequest(`/users/${id}`, "PUT", payload, true);
        return { success: true, user: result.user };
    } catch (error) {
        if (isFetchError(error)) {
            var localUser = performLocalUpdateUser(id, payload);
            if (localUser) return { success: true, user: localUser };
        }
        return { success: false, error: error.message };
    }
}

async function tryDeleteUser(id) {
    try {
        await apiRequest(`/users/${id}`, "DELETE", null, true);
        return { success: true };
    } catch (error) {
        if (isFetchError(error)) {
            var localResult = performLocalDeleteUser(id);
            if (localResult) return { success: true };
        }
        return { success: false, error: error.message };
    }
}

function getNextLocalUserId() {
    var users = getUsers();
    var maxId = 0;
    users.forEach(function (u) {
        var uid = Number(u.id || 0);
        if (Number.isFinite(uid) && uid > maxId) maxId = uid;
    });
    return maxId + 1;
}

function performLocalCreateUser(payload) {
    var users = getUsers();
    var exists = users.some(function (u) { return normalizeEmail(u.user) === normalizeEmail(payload.email); });
    if (exists) return null;
    var newUser = {
        id: getNextLocalUserId(),
        name: payload.name || "",
        firstName: payload.firstName || "",
        lastNamePaternal: payload.lastNamePaternal || "",
        lastNameMaternal: payload.lastNameMaternal || "",
        user: normalizeEmail(payload.email),
        role: payload.role || "user",
        age: payload.age || null,
        birthDate: payload.birthDate || "",
        practiceDeporte: payload.practiceDeporte === true || payload.practiceDeporte === "si",
        typeDeporte: payload.typeDeporte || "",
        objectivePersonal: payload.objectivePersonal || "",
        level: payload.level || "",
        healthCondition: payload.healthCondition || payload.infoAdicional || "",
        infoAdicional: payload.infoAdicional || "",
        createdAt: new Date().toISOString(),
        password: payload.password || "1234"
    };
    users.push(newUser);
    saveUsers(users);
    return newUser;
}

function performLocalUpdateUser(id, payload) {
    var users = getUsers();
    var user = users.find(function (u) { return String(u.id) === String(id); });
    if (!user) return null;
    user.name = payload.name || user.name;
    user.firstName = payload.firstName !== undefined ? payload.firstName : user.firstName;
    user.lastNamePaternal = payload.lastNamePaternal !== undefined ? payload.lastNamePaternal : user.lastNamePaternal;
    user.lastNameMaternal = payload.lastNameMaternal !== undefined ? payload.lastNameMaternal : user.lastNameMaternal;
    user.role = payload.role || user.role;
    user.age = payload.age !== undefined ? payload.age : user.age;
    user.birthDate = payload.birthDate !== undefined ? payload.birthDate : user.birthDate;
    user.practiceDeporte = payload.practiceDeporte !== undefined ? (payload.practiceDeporte === true || payload.practiceDeporte === "si") : user.practiceDeporte;
    user.typeDeporte = payload.typeDeporte !== undefined ? payload.typeDeporte : user.typeDeporte;
    user.objectivePersonal = payload.objectivePersonal !== undefined ? payload.objectivePersonal : user.objectivePersonal;
    user.level = payload.level !== undefined ? payload.level : user.level;
    user.healthCondition = payload.healthCondition !== undefined ? payload.healthCondition : user.healthCondition;
    user.infoAdicional = payload.infoAdicional !== undefined ? payload.infoAdicional : user.infoAdicional;
    if (payload.password) user.password = payload.password;
    saveUsers(users);
    return user;
}

function performLocalDeleteUser(id) {
    var users = getUsers();
    var idx = users.findIndex(function (u) { return String(u.id) === String(id); });
    if (idx === -1) return false;
    users.splice(idx, 1);
    saveUsers(users);
    return true;
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

    if (!payload.email || !payload.password || !payload.confirmPassword) {
        setMessage(messageElement, "Completa correo, contraseña y confirmación.", "message-error");
        return null;
    }

    if (payload.password.length < 8) {
        setMessage(messageElement, "La contraseña debe tener al menos 8 caracteres.", "message-error");
        return null;
    }

    if (payload.password !== payload.confirmPassword) {
        setMessage(messageElement, "Las contraseñas no coinciden.", "message-error");
        return null;
    }

    if (alreadyExists) {
        setMessage(messageElement, "Ese correo ya está registrado. Intenta iniciar sesión.", "message-error");
        return null;
    }

    const newUser = {
        id: getNextLocalUserId(),
        name: payload.name || buildFullName(payload.firstName, payload.lastNamePaternal, payload.lastNameMaternal) || "Nuevo usuario",
        firstName: payload.firstName || "",
        lastNamePaternal: payload.lastNamePaternal || "",
        lastNameMaternal: payload.lastNameMaternal || "",
        user: payload.email,
        password: payload.password,
        role: "user",
        age: payload.age,
        birthDate: payload.birthDate || "",
        practiceDeporte: payload.practiceDeporte === true || payload.practiceDeporte === "si",
        typeDeporte: payload.typeDeporte || "",
        objectivePersonal: payload.objectivePersonal || "",
        level: payload.level || "",
        healthCondition: payload.healthCondition || payload.infoAdicional || "",
        infoAdicional: payload.infoAdicional || payload.healthCondition || "",
        createdAt: new Date().toISOString()
    };

    users.push(newUser);
    saveUsers(users);

    return {
        name: newUser.name,
        user: newUser.user,
        role: newUser.role
    };
}

function performLocalProfileUpdate(payload, messageElement) {
    const loggedUser = getLoggedUser();
    if (!loggedUser) {
        setMessage(messageElement, "No hay sesión activa.", "message-error");
        return null;
    }

    const users = getUsers();
    const matchedUser = users.find(function (currentUser) {
        return normalizeEmail(currentUser.user) === loggedUser.user;
    });

    if (!matchedUser) {
        setMessage(messageElement, "Usuario local no encontrado.", "message-error");
        return null;
    }

    matchedUser.name = payload.name || matchedUser.name;
    matchedUser.age = payload.age || matchedUser.age;
    matchedUser.birthDate = payload.birthDate || matchedUser.birthDate;
    matchedUser.practiceDeporte = typeof payload.practiceDeporte !== "undefined" ? payload.practiceDeporte : matchedUser.practiceDeporte;
    matchedUser.typeDeporte = payload.typeDeporte || matchedUser.typeDeporte;
    matchedUser.objectivePersonal = payload.objectivePersonal || matchedUser.objectivePersonal;
    matchedUser.level = payload.level || matchedUser.level;
    matchedUser.infoAdicional = payload.infoAdicional || matchedUser.infoAdicional;

    saveUsers(users);

    const updatedSession = {
        user: {
            name: matchedUser.name,
            user: normalizeEmail(matchedUser.user),
            role: matchedUser.role
        },
        token: getAuthToken()
    };
    saveSession(updatedSession);

    return updatedSession.user;
}

function performLocalPasswordChange(currentPassword, newPassword, confirmPassword, messageElement) {
    const loggedUser = getLoggedUser();
    if (!loggedUser) {
        setMessage(messageElement, "No hay sesión activa.", "message-error");
        return false;
    }

    const users = getUsers();
    const matchedUser = users.find(function (currentUser) {
        return normalizeEmail(currentUser.user) === loggedUser.user;
    });

    if (!matchedUser) {
        setMessage(messageElement, "Usuario local no encontrado.", "message-error");
        return false;
    }

    if (matchedUser.password !== currentPassword) {
        setMessage(messageElement, "La contraseña actual es incorrecta.", "message-error");
        return false;
    }

    if (newPassword.length < 8) {
        setMessage(messageElement, "La nueva contraseña debe tener al menos 8 caracteres.", "message-error");
        return false;
    }

    if (newPassword !== confirmPassword) {
        setMessage(messageElement, "Las nuevas contraseñas no coinciden.", "message-error");
        return false;
    }

    matchedUser.password = newPassword;
    saveUsers(users);
    return true;
}

function getRoleBadge(role) {
    const className = role === "admin" ? "badge-admin" : role === "coach" ? "badge-coach" : "badge-user";
    return `<span class="badge ${className}">${escapeHTML(role)}</span>`;
}

function handleLoginPage() {
    const form = document.querySelector("#login-form");
    if (!form) return;

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
                user: {
                    name: apiResult.user.name,
                    user: normalizeEmail(apiResult.user.user),
                    role: apiResult.user.role
                },
                token: apiResult.token || null
            };
            saveSession(sessionUser);
            setMessage(messageElement, "Has ingresado correctamente.", "message-success");
            window.setTimeout(function () {
                redirectToDashboard(sessionUser.user.role);
            }, 500);
            return;
        }

        if (apiResult.fallback) {
            var localUser = performLocalLogin(inputEmail, inputPassword, messageElement);
            if (localUser) {
                saveSession({ user: localUser });
                setMessage(messageElement, "Has ingresado correctamente.", "message-success");
                window.setTimeout(function () {
                    redirectToDashboard(localUser.role);
                }, 500);
                return;
            }
        }

        setMessage(messageElement, "Credenciales incorrectas.", "message-error");
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
    const confirmPasswordInput = document.querySelector("#confirmPassword");
    const firstNameInput = document.querySelector("#firstName");
    const lastNamePaternalInput = document.querySelector("#lastNamePaternal");
    const lastNameMaternalInput = document.querySelector("#lastNameMaternal");
    const legacyNameInput = document.querySelector("#name");
    const ageInput = document.querySelector("#age");
    const birthDateInput = document.querySelector("#birthDate");
    const practiceDeporteInput = document.querySelector("#practiceDeporte");
    const typeDeporteInput = document.querySelector("#typeDeporte");
    const objectivePersonalInput = document.querySelector("#objectivePersonal");
    const levelInput = document.querySelector("#level");
    const infoAdicionalInput = document.querySelector("#infoAdicional");
    const healthConditionInput = document.querySelector("#healthCondition");
    const messageElement = document.querySelector("#register-message");

    if (practiceDeporteInput && levelInput) {
        practiceDeporteInput.addEventListener("change", function () {
            if (practiceDeporteInput.value === "no") {
                levelInput.value = "principiante";
            }
        });
    }

    form.addEventListener("submit", async function (event) {
        event.preventDefault();
        clearInputErrors(form);

        const firstName = firstNameInput ? firstNameInput.value.trim() : "";
        const lastNamePaternal = lastNamePaternalInput ? lastNamePaternalInput.value.trim() : "";
        const lastNameMaternal = lastNameMaternalInput ? lastNameMaternalInput.value.trim() : "";
        const fullName = legacyNameInput ? legacyNameInput.value.trim() : buildFullName(firstName, lastNamePaternal, lastNameMaternal);

        const payload = {
            email: normalizeEmail(emailInput.value),
            password: String(passwordInput.value || "").trim(),
            confirmPassword: String(confirmPasswordInput.value || "").trim(),
            name: fullName,
            firstName,
            lastNamePaternal,
            lastNameMaternal,
            age: ageInput.value ? Number(ageInput.value) : null,
            birthDate: birthDateInput ? String(birthDateInput.value || "").trim() : "",
            practiceDeporte: practiceDeporteInput ? practiceDeporteInput.value : "",
            typeDeporte: typeDeporteInput ? String(typeDeporteInput.value || "").trim() : "",
            objectivePersonal: objectivePersonalInput ? String(objectivePersonalInput.value || "").trim() : "",
            level: String(levelInput.value || "").trim(),
            healthCondition: healthConditionInput ? String(healthConditionInput.value || "").trim() : "",
            infoAdicional: infoAdicionalInput ? String(infoAdicionalInput.value || "").trim() : ""
        };

        if (firstNameInput && !payload.firstName) {
            setInputError(firstNameInput, "El nombre es obligatorio.");
            return;
        }

        if (lastNamePaternalInput && !payload.lastNamePaternal) {
            setInputError(lastNamePaternalInput, "El apellido paterno es obligatorio.");
            return;
        }

        if (lastNameMaternalInput && !payload.lastNameMaternal) {
            setInputError(lastNameMaternalInput, "El apellido materno es obligatorio.");
            return;
        }

        if (!payload.age) {
            setInputError(ageInput, "La edad es obligatoria.");
            return;
        }

        if (payload.age < 12 || payload.age > 120) {
            setInputError(ageInput, "La edad debe estar entre 12 y 120.");
            return;
        }

        if (!payload.email) {
            setInputError(emailInput, "El email es obligatorio.");
            return;
        }

        if (!payload.password) {
            setInputError(passwordInput, "La contraseña es obligatoria.");
            return;
        }

        if (payload.password.length < 8) {
            setInputError(passwordInput, "La contraseña debe tener al menos 8 caracteres.");
            return;
        }

        if (payload.password !== payload.confirmPassword) {
            setInputError(confirmPasswordInput, "Las contraseñas no coinciden.");
            return;
        }

        if (practiceDeporteInput && !payload.practiceDeporte) {
            setInputError(practiceDeporteInput, "Selecciona si haces deporte.");
            return;
        }

        if (!payload.level) {
            setInputError(levelInput, "Selecciona tu nivel actual.");
            return;
        }

        if (healthConditionInput && !payload.healthCondition) {
            setInputError(healthConditionInput, "Indica tu condicion de salud o escribe 'Ninguna'.");
            return;
        }

        var apiResult;
        try { apiResult = await tryFetchRegister(payload); } catch (e) { apiResult = { success: false, fallback: true, error: e.message }; }

        if (apiResult.success && apiResult.user) {
            const sessionUser = {
                user: {
                    name: apiResult.user.name,
                    user: normalizeEmail(apiResult.user.user),
                    role: apiResult.user.role
                },
                token: apiResult.token || null
            };
            saveSession(sessionUser);
            setMessage(messageElement, "Perfil creado correctamente. Redirigiendo al dashboard...", "message-success");
            window.setTimeout(function () {
                redirectToDashboard(sessionUser.user.role);
            }, 700);
            return;
        }

        if (apiResult.fallback) {
            var localUser = performLocalRegister(payload, messageElement);
            if (localUser) {
                saveSession({ user: localUser });
                setMessage(messageElement, "Perfil creado correctamente. Redirigiendo al dashboard...", "message-success");
                window.setTimeout(function () {
                    redirectToDashboard(localUser.role);
                }, 700);
                return;
            }
        }

        setMessage(messageElement, apiResult.error || "Error al registrarte. Revisa los datos.", "message-error");
    });

    [emailInput, passwordInput, confirmPasswordInput, firstNameInput, lastNamePaternalInput, lastNameMaternalInput, legacyNameInput, ageInput, birthDateInput, practiceDeporteInput, typeDeporteInput, objectivePersonalInput, levelInput, infoAdicionalInput, healthConditionInput].forEach(function (input) {
        if (!input) return;
        input.addEventListener("input", function () {
            clearMessage(messageElement);
            clearInputErrors(form);
        });
    });
}

function handleAdminPage() {
    const tableBody = document.querySelector("#admin-users-table-body");
    if (!tableBody) return;

    const adminMessage = document.querySelector("#admin-message");
    const adminFormSection = document.querySelector("#admin-user-form-section");
    const adminForm = document.querySelector("#user-form");
    const newUserButton = document.querySelector("#new-user-button");
    const cancelUserFormButton = document.querySelector("#cancel-user-form");
    const formTitle = document.querySelector("#admin-user-form-title");
    const submitButton = document.querySelector("#admin-user-form-submit");

    let editingUserId = null;

    function getUserFormData() {
        return {
            id: editingUserId,
            name: document.querySelector("#admin-name").value.trim(),
            firstName: document.querySelector("#admin-firstName").value.trim(),
            lastNamePaternal: document.querySelector("#admin-lastNamePaternal").value.trim(),
            lastNameMaternal: document.querySelector("#admin-lastNameMaternal").value.trim(),
            email: normalizeEmail(document.querySelector("#admin-email").value),
            role: document.querySelector("#admin-role").value,
            password: document.querySelector("#admin-password").value,
            confirmPassword: document.querySelector("#admin-confirmPassword").value,
            birthDate: document.querySelector("#admin-birthDate").value,
            age: document.querySelector("#admin-age").value ? Number(document.querySelector("#admin-age").value) : null,
            practiceDeporte: document.querySelector("#admin-practiceDeporte").checked,
            typeDeporte: document.querySelector("#admin-typeDeporte").value.trim(),
            objectivePersonal: document.querySelector("#admin-objectivePersonal").value.trim(),
            level: document.querySelector("#admin-level").value,
            infoAdicional: document.querySelector("#admin-infoAdicional").value.trim(),
            healthCondition: document.querySelector("#admin-healthCondition").value.trim()
        };
    }

    function updateFormTitle() {
        formTitle.textContent = editingUserId ? "Editar Usuario" : "Nuevo Usuario";
        submitButton.textContent = editingUserId ? "Actualizar usuario" : "Crear usuario";
    }

    function resetAdminForm() {
        editingUserId = null;
        adminForm.reset();
        document.querySelector("#editing-user-id").value = "";
        updateFormTitle();
        clearMessage(adminMessage);
        clearInputErrors(adminForm);
        if (adminFormSection) {
            adminFormSection.classList.add("is-hidden");
        }
    }

    function fillAdminForm(user) {
        editingUserId = user.id;
        document.querySelector("#editing-user-id").value = user.id;
        document.querySelector("#admin-name").value = user.name || "";
        document.querySelector("#admin-firstName").value = user.firstName || "";
        document.querySelector("#admin-lastNamePaternal").value = user.lastNamePaternal || "";
        document.querySelector("#admin-lastNameMaternal").value = user.lastNameMaternal || "";
        document.querySelector("#admin-email").value = user.user || "";
        document.querySelector("#admin-role").value = user.role || "user";
        document.querySelector("#admin-password").value = "";
        document.querySelector("#admin-confirmPassword").value = "";
        document.querySelector("#admin-birthDate").value = user.birthDate || "";
        document.querySelector("#admin-age").value = user.age || "";
        document.querySelector("#admin-practiceDeporte").checked = !!user.practiceDeporte;
        document.querySelector("#admin-typeDeporte").value = user.typeDeporte || "";
        document.querySelector("#admin-objectivePersonal").value = user.objectivePersonal || "";
        document.querySelector("#admin-level").value = user.level || "";
        document.querySelector("#admin-infoAdicional").value = user.infoAdicional || "";
        document.querySelector("#admin-healthCondition").value = user.healthCondition || user.infoAdicional || "";
        updateFormTitle();
        adminFormSection.classList.remove("is-hidden");
    }

    function renderUsersTable(users) {
        if (!users || users.length === 0) {
            tableBody.innerHTML = "<tr><td colspan=10>No hay usuarios registrados.</td></tr>";
            return;
        }

        tableBody.innerHTML = users
            .map(function (user) {
                const userId = escapeHTML(user.id);
                const userName = escapeHTML(user.name);
                const userLastNamePaternal = escapeHTML(user.lastNamePaternal || "-");
                const userLastNameMaternal = escapeHTML(user.lastNameMaternal || "-");
                const userEmail = escapeHTML(user.user);
                const userCreatedAt = escapeHTML(formatDate(user.createdAt));
                const userLevel = escapeHTML(user.level || "-");
                const userHealth = escapeHTML(user.healthCondition || user.infoAdicional || "-");

                return `
                    <tr>
                        <td>${userId}</td>
                        <td>${userName}</td>
                        <td>${userLastNamePaternal}</td>
                        <td>${userLastNameMaternal}</td>
                        <td>${userEmail}</td>
                        <td>${getRoleBadge(user.role)}</td>
                        <td>${userLevel}</td>
                        <td>${userHealth}</td>
                        <td>${userCreatedAt}</td>
                        <td>
                            <button type="button" data-edit-id="${userId}" class="btn btn-ghost admin-action-button">Editar</button>
                            <button type="button" data-delete-id="${userId}" class="btn btn-danger admin-action-button">Eliminar</button>
                        </td>
                    </tr>
                `;
            })
            .join("");
    }

    async function loadAdminUsers() {
        clearMessage(adminMessage);

        const result = await tryFetchUsers();
        if (result.success) {
            renderUsersTable(result.users);
            return;
        }

        if (result.fallback) {
            renderUsersTable(getUsers());
            setMessage(adminMessage, "Conexión al backend fallida. Se muestra la copia local.", "message-error");
            return;
        }

        setMessage(adminMessage, result.error || "No se pudo cargar la lista de usuarios.", "message-error");
    }

    newUserButton.addEventListener("click", function () {
        adminForm.reset();
        editingUserId = null;
        updateFormTitle();
        clearInputErrors(adminForm);
        adminFormSection.classList.remove("is-hidden");
    });

    cancelUserFormButton.addEventListener("click", function () {
        resetAdminForm();
    });

    adminForm.addEventListener("submit", async function (event) {
        event.preventDefault();
        clearInputErrors(adminForm);
        clearMessage(adminMessage);

        const payload = getUserFormData();

        if (!payload.name) {
            setInputError(document.querySelector("#admin-name"), "El nombre es obligatorio.");
            return;
        }

        if (!payload.email) {
            setInputError(document.querySelector("#admin-email"), "El email es obligatorio.");
            return;
        }

        if (!editingUserId && !payload.password) {
            setInputError(document.querySelector("#admin-password"), "La contraseña es obligatoria para un nuevo usuario.");
            return;
        }

        if (payload.password && payload.password.length < 8) {
            setInputError(document.querySelector("#admin-password"), "La contraseña debe tener al menos 8 caracteres.");
            return;
        }

        if (payload.password && payload.password !== payload.confirmPassword) {
            setInputError(document.querySelector("#admin-confirmPassword"), "Las contraseñas no coinciden.");
            return;
        }

        const result = editingUserId ? await tryUpdateUser(editingUserId, payload) : await tryCreateUser(payload);

        if (!result.success) {
            setMessage(adminMessage, result.error || "Error al guardar el usuario.", "message-error");
            return;
        }

        await loadAdminUsers();
        setMessage(adminMessage, editingUserId ? "Usuario actualizado correctamente." : "Usuario creado correctamente.", "message-success");
        resetAdminForm();
    });

    tableBody.addEventListener("click", async function (event) {
        const editButton = event.target.closest("[data-edit-id]");
        const deleteButton = event.target.closest("[data-delete-id]");

        if (editButton) {
            const userId = editButton.dataset.editId;
            const result = await tryFetchUser(userId);
            if (!result.success) {
                setMessage(adminMessage, result.error || "No se pudo cargar el usuario.", "message-error");
                return;
            }
            fillAdminForm(result.user);
            return;
        }

        if (deleteButton) {
            const userId = deleteButton.dataset.deleteId;
            const confirmDelete = window.confirm("¿Estás seguro de eliminar este usuario? Esta acción no se puede deshacer.");
            if (!confirmDelete) {
                return;
            }
            const result = await tryDeleteUser(userId);
            if (!result.success) {
                setMessage(adminMessage, result.error || "No se pudo eliminar el usuario.", "message-error");
                return;
            }
            await loadAdminUsers();
            setMessage(adminMessage, "Usuario eliminado correctamente.", "message-success");
        }
    });

    loadAdminUsers();
}

function handleProfilePage() {
    const profileForm = document.querySelector("#profile-form");
    const passwordForm = document.querySelector("#password-form");
    if (!profileForm || !passwordForm) return;

    const profileEditSection = document.querySelector("#profile-edit-section");
    const passwordChangeSection = document.querySelector("#password-change-section");
    const profileName = document.querySelector("[data-user-name]");
    const profileEmail = document.querySelector("[data-user-email]");
    const profileRole = document.querySelector("[data-user-role]");
    const profileBirthDate = document.querySelector("[data-user-birthdate]");
    const profileObjective = document.querySelector("[data-user-objective]");
    const profileMessage = document.querySelector("#profile-message");
    const passwordMessage = document.querySelector("#password-message");

    const nameInput = document.querySelector("#profile-name");
    const birthDateInput = document.querySelector("#profile-birthDate");
    const ageInput = document.querySelector("#profile-age");
    const practiceDeporteInput = document.querySelector("#profile-practiceDeporte");
    const typeDeporteInput = document.querySelector("#profile-typeDeporte");
    const objectiveInput = document.querySelector("#profile-objectivePersonal");
    const levelInput = document.querySelector("#profile-level");
    const infoInput = document.querySelector("#profile-infoAdicional");
    const currentPasswordInput = document.querySelector("#current-password");
    const newPasswordInput = document.querySelector("#new-password");
    const confirmNewPasswordInput = document.querySelector("#confirm-new-password");

    function openProfilePanel(panelName) {
        const targetSection = panelName === "password" ? passwordChangeSection : profileEditSection;
        const otherSection = panelName === "password" ? profileEditSection : passwordChangeSection;

        if (!targetSection || !otherSection) {
            return;
        }

        otherSection.classList.add("is-hidden");
        targetSection.classList.remove("is-hidden");
        targetSection.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    document.querySelectorAll("[data-profile-action]").forEach(function (button) {
        button.addEventListener("click", function (event) {
            event.preventDefault();
            openProfilePanel(button.dataset.profileAction);
        });
    });

    async function refreshProfileData() {
        clearMessage(profileMessage);
        const result = await tryFetchProfile();
        if (result.success) {
            updateProfileUI(result.user);
            fillProfileForm(result.user);
            return;
        }

        if (result.fallback) {
            const localUser = getLoggedUser();
            if (localUser) {
                updateProfileUI(localUser);
                fillProfileForm(localUser);
            }
            return;
        }

        setMessage(profileMessage, result.error || "No se pudo cargar el perfil.", "message-error");
    }

    function updateProfileUI(user) {
        document.querySelectorAll("[data-user-name]").forEach(function (element) {
            element.textContent = user.name;
        });
        document.querySelectorAll("[data-user-email]").forEach(function (element) {
            element.textContent = user.user;
        });
        document.querySelectorAll("[data-user-role]").forEach(function (element) {
            element.textContent = user.role;
        });
        if (profileBirthDate) profileBirthDate.textContent = formatDate(user.birthDate);
        if (profileObjective) profileObjective.textContent = user.objectivePersonal || "Sin objetivos definidos.";
    }

    function fillProfileForm(user) {
        nameInput.value = user.name || "";
        birthDateInput.value = user.birthDate || "";
        ageInput.value = user.age || "";
        practiceDeporteInput.checked = !!user.practiceDeporte;
        typeDeporteInput.value = user.typeDeporte || "";
        objectiveInput.value = user.objectivePersonal || "";
        levelInput.value = user.level || "";
        infoInput.value = user.infoAdicional || "";
    }

    profileForm.addEventListener("submit", async function (event) {
        event.preventDefault();
        clearInputErrors(profileForm);
        clearMessage(profileMessage);

        const payload = {
            name: nameInput.value.trim(),
            birthDate: birthDateInput.value,
            age: ageInput.value ? Number(ageInput.value) : null,
            practiceDeporte: practiceDeporteInput.checked,
            typeDeporte: typeDeporteInput.value.trim(),
            objectivePersonal: objectiveInput.value.trim(),
            level: levelInput.value,
            infoAdicional: infoInput.value.trim()
        };

        if (!payload.name) {
            setInputError(nameInput, "El nombre es obligatorio.");
            return;
        }

        if (!window.confirm("Guardar cambios del perfil?")) {
            return;
        }

        if (getAuthToken()) {
            const result = await tryUpdateProfile(payload);
            if (result.success) {
                saveSession({ user: { name: result.user.name, user: normalizeEmail(result.user.user), role: result.user.role }, token: getAuthToken() });
                updateProfileUI(result.user);
                setMessage(profileMessage, "Perfil actualizado correctamente.", "message-success");
                return;
            }
            setMessage(profileMessage, result.error || "No se pudo actualizar el perfil.", "message-error");
            return;
        }

        const localUser = performLocalProfileUpdate(payload, profileMessage);
        if (localUser) {
            updateProfileUI(localUser);
            setMessage(profileMessage, "Perfil actualizado localmente.", "message-success");
        }
    });

    passwordForm.addEventListener("submit", async function (event) {
        event.preventDefault();
        clearInputErrors(passwordForm);
        clearMessage(passwordMessage);

        const currentPassword = currentPasswordInput.value.trim();
        const newPassword = newPasswordInput.value.trim();
        const confirmPassword = confirmNewPasswordInput.value.trim();

        if (!currentPassword) {
            setInputError(currentPasswordInput, "Debes ingresar la contraseña actual.");
            return;
        }

        if (newPassword.length < 8) {
            setInputError(newPasswordInput, "La nueva contraseña debe tener al menos 8 caracteres.");
            return;
        }

        if (newPassword !== confirmPassword) {
            setInputError(confirmNewPasswordInput, "Las contraseñas no coinciden.");
            return;
        }

        if (!window.confirm("Guardar nueva contrasena?")) {
            return;
        }

        if (getAuthToken()) {
            const result = await tryChangePassword({ currentPassword, newPassword, confirmPassword });
            if (result.success) {
                passwordForm.reset();
                setMessage(passwordMessage, result.message || "Contraseña actualizada correctamente.", "message-success");
                return;
            }
            setMessage(passwordMessage, result.error || "No se pudo cambiar la contraseña.", "message-error");
            return;
        }

        const localSuccess = performLocalPasswordChange(currentPassword, newPassword, confirmPassword, passwordMessage);
        if (localSuccess) {
            passwordForm.reset();
            setMessage(passwordMessage, "Contraseña actualizada localmente.", "message-success");
        }
    });

    refreshProfileData();
}

function populateDashboard(loggedUser) {
    document.querySelectorAll("[data-user-name]").forEach(function (element) {
        element.textContent = loggedUser.name;
    });

    document.querySelectorAll("[data-user-email]").forEach(function (element) {
        element.textContent = loggedUser.user;
    });

    document.querySelectorAll("[data-user-role]").forEach(function (element) {
        element.textContent = loggedUser.role;
    });

    document.querySelectorAll("[data-logout]").forEach(function (button) {
        button.addEventListener("click", function (event) {
            event.preventDefault();
            clearSession();
            window.location.href = "login.html";
        });
    });
}

function normalizeAppPath(pathname) {
    var path = pathname || window.location.pathname;

    if (path === "/" || path.endsWith("/dashboard_usuario.html")) {
        return "/dashboard_usuario.html";
    }

    if (path.endsWith("/clases")) return "/clases";
    if (path.endsWith("/reservas")) return "/reservas";
    if (path.endsWith("/progreso")) return "/progreso";
    if (path.endsWith("/perfil/editar")) return "/perfil/editar";

    return path;
}

function handleSpaRoutes() {
    const views = Array.from(document.querySelectorAll("[data-view]"));
    if (!views.length) return;

    function getDefaultRoute() {
        return views[0].dataset.view;
    }

    function setActiveRoute(route) {
        const normalizedRoute = normalizeAppPath(route);
        const targetRoute = views.some(function (view) {
            return view.dataset.view === normalizedRoute;
        }) ? normalizedRoute : getDefaultRoute();

        views.forEach(function (view) {
            view.classList.toggle("is-active", view.dataset.view === targetRoute);
        });

        document.querySelectorAll("[data-spa-nav] a, .topbar-actions [data-route]").forEach(function (link) {
            if (link.dataset.route === targetRoute) {
                link.setAttribute("aria-current", "page");
            } else {
                link.removeAttribute("aria-current");
            }
        });

        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    document.querySelectorAll("[data-route]").forEach(function (link) {
        link.addEventListener("click", function (event) {
            const route = link.dataset.route;
            if (!route) return;

            event.preventDefault();
            window.history.pushState({}, "", route);
            setActiveRoute(route);
        });
    });

    window.addEventListener("popstate", function () {
        setActiveRoute(window.location.pathname);
    });

    setActiveRoute(window.location.pathname);
}

function handleClassFilters() {
    const filter = document.querySelector("[data-class-filter]");
    if (!filter) return;

    filter.addEventListener("change", function () {
        const selectedType = filter.value;
        document.querySelectorAll("[data-class-type]").forEach(function (card) {
            card.classList.toggle("is-hidden", selectedType !== "all" && card.dataset.classType !== selectedType);
        });
    });
}

function handleInlineConfirmations() {
    document.querySelectorAll("[data-confirm]").forEach(function (button) {
        button.addEventListener("click", function () {
            if (window.confirm("Confirmar esta accion?")) {
                window.alert(button.dataset.confirm);
            }
        });
    });

    document.querySelectorAll("[data-confirm-form]").forEach(function (form) {
        form.addEventListener("submit", function (event) {
            event.preventDefault();
            const message = form.querySelector(".message");
            if (!window.confirm("Guardar cambios?")) {
                return;
            }
            setMessage(message, "Reserva agendada correctamente.", "message-success");
        });
    });
}

async function handleDashboardPage() {
    const requiredRole = document.body.dataset.requiredRole;
    if (!requiredRole) return;

    const loggedUser = getLoggedUser();
    const authToken = getAuthToken();

    if (!loggedUser) {
        window.location.href = "login.html";
        return;
    }

    if (authToken) {
        const profileResult = await tryFetchProfile();
        if (profileResult.success) {
            if (profileResult.user.role !== requiredRole) {
                clearSession();
                window.location.href = "login.html";
                return;
            }
            saveSession({
                user: {
                    name: profileResult.user.name,
                    user: normalizeEmail(profileResult.user.user),
                    role: profileResult.user.role
                },
                token: authToken
            });
            populateDashboard(profileResult.user);
            return;
        }

        if (!profileResult.fallback) {
            clearSession();
            window.location.href = "login.html";
            return;
        }
    }

    if (loggedUser.role !== requiredRole) {
        window.location.href = "login.html";
        return;
    }

    populateDashboard(loggedUser);
}

document.addEventListener("DOMContentLoaded", async function () {
    initializeUsersStore();
    handleLoginPage();
    handleRegisterPage();
    handleSpaRoutes();
    handleClassFilters();
    handleInlineConfirmations();
    handleAdminPage();
    handleProfilePage();
    await handleDashboardPage();
});
