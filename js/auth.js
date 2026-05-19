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
    if (!stored) return null;
    try { return JSON.parse(stored); } catch (e) {
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
    const stored = localStorage.getItem(USERS_STORAGE_KEY);
    if (!stored) {
        saveUsers(defaultUsers);
        return defaultUsers.slice();
    }
    try {
        const parsed = JSON.parse(stored);
        return Array.isArray(parsed) ? parsed : defaultUsers.slice();
    } catch (e) {
        saveUsers(defaultUsers);
        return defaultUsers.slice();
    }
}

function saveUsers(usersList) {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(usersList));
}

function getNextLocalUserId() {
    const users = getUsers();
    let maxId = 0;
    users.forEach(function (u) {
        const uid = Number(u.id || 0);
        if (Number.isFinite(uid) && uid > maxId) maxId = uid;
    });
    return maxId + 1;
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
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.valueOf())) return value;
    return `${String(date.getDate()).padStart(2, "0")}/${String(date.getMonth() + 1).padStart(2, "0")}/${date.getFullYear()}`;
}

function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, function (character) {
        return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[character];
    });
}

function getRoleBadge(role) {
    const className = role === "admin" ? "badge-admin" : role === "coach" ? "badge-coach" : "badge-user";
    return `<span class="badge ${className}">${escapeHTML(role)}</span>`;
}

// ==================== LOGIN ====================

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

        // Intentar API primero
        try {
            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: inputEmail, password: inputPassword })
            });
            
            if (response.ok) {
                const result = await response.json();
                if (result.user && result.token) {
                    saveSession({
                        user: { name: result.user.name, user: normalizeEmail(result.user.user), role: result.user.role },
                        token: result.token
                    });
                    setMessage(messageElement, "Has ingresado correctamente.", "message-success");
                    setTimeout(function () { redirectToDashboard(result.user.role); }, 500);
                    return;
                }
            }
        } catch (error) {
            // API no disponible, usar localStorage
        }

        // Fallback a localStorage
        const users = getUsers();
        const matchedUser = users.find(function (u) {
            return normalizeEmail(u.user) === inputEmail && u.password === inputPassword;
        });

        if (!matchedUser) {
            setMessage(messageElement, "Credenciales incorrectas.", "message-error");
            return;
        }

        saveSession({
            user: { name: matchedUser.name, user: normalizeEmail(matchedUser.user), role: matchedUser.role },
            token: "local-" + Date.now()
        });
        setMessage(messageElement, "Has ingresado correctamente.", "message-success");
        setTimeout(function () { redirectToDashboard(matchedUser.role); }, 500);
    });

    [emailInput, passwordInput].forEach(function (input) {
        if (!input) return;
        input.addEventListener("input", function () { clearMessage(messageElement); });
    });
}

// ==================== REGISTRO ====================

function handleRegisterPage() {
    const form = document.querySelector("#register-form");
    if (!form) return;

    const emailInput = document.querySelector("#email");
    const passwordInput = document.querySelector("#password");
    const confirmPasswordInput = document.querySelector("#confirmPassword");
    const firstNameInput = document.querySelector("#firstName");
    const lastNamePaternalInput = document.querySelector("#lastNamePaternal");
    const lastNameMaternalInput = document.querySelector("#lastNameMaternal");
    const ageInput = document.querySelector("#age");
    const practiceDeporteInput = document.querySelector("#practiceDeporte");
    const levelInput = document.querySelector("#level");
    const healthConditionInput = document.querySelector("#healthCondition");
    const messageElement = document.querySelector("#register-message");

    if (practiceDeporteInput && levelInput) {
        practiceDeporteInput.addEventListener("change", function () {
            if (practiceDeporteInput.value === "no") levelInput.value = "principiante";
        });
    }

    form.addEventListener("submit", async function (event) {
        event.preventDefault();
        clearInputErrors(form);

        const firstName = firstNameInput ? firstNameInput.value.trim() : "";
        const lastNamePaternal = lastNamePaternalInput ? lastNamePaternalInput.value.trim() : "";
        const lastNameMaternal = lastNameMaternalInput ? lastNameMaternalInput.value.trim() : "";
        const fullName = buildFullName(firstName, lastNamePaternal, lastNameMaternal);

        const payload = {
            email: normalizeEmail(emailInput.value),
            password: String(passwordInput.value || "").trim(),
            confirmPassword: String(confirmPasswordInput.value || "").trim(),
            name: fullName,
            firstName,
            lastNamePaternal,
            lastNameMaternal,
            age: ageInput.value ? Number(ageInput.value) : null,
            practiceDeporte: practiceDeporteInput ? practiceDeporteInput.value : "",
            level: String(levelInput.value || "").trim(),
            healthCondition: healthConditionInput ? String(healthConditionInput.value || "").trim() : "",
            infoAdicional: healthConditionInput ? String(healthConditionInput.value || "").trim() : ""
        };

        // Validaciones
        if (!payload.firstName) { setInputError(firstNameInput, "El nombre es obligatorio."); return; }
        if (!payload.lastNamePaternal) { setInputError(lastNamePaternalInput, "El apellido paterno es obligatorio."); return; }
        if (!payload.lastNameMaternal) { setInputError(lastNameMaternalInput, "El apellido materno es obligatorio."); return; }
        if (!payload.age || payload.age < 12 || payload.age > 120) { setInputError(ageInput, "La edad debe estar entre 12 y 120."); return; }
        if (!payload.email) { setInputError(emailInput, "El email es obligatorio."); return; }
        if (!payload.password || payload.password.length < 8) { setInputError(passwordInput, "La contraseña debe tener al menos 8 caracteres."); return; }
        if (payload.password !== payload.confirmPassword) { setInputError(confirmPasswordInput, "Las contraseñas no coinciden."); return; }
        if (!payload.practiceDeporte) { setInputError(practiceDeporteInput, "Selecciona si haces deporte."); return; }
        if (!payload.level) { setInputError(levelInput, "Selecciona tu nivel actual."); return; }
        if (!payload.healthCondition) { setInputError(healthConditionInput, "Indica tu condicion de salud o escribe 'Ninguna'."); return; }

        // Intentar API primero
        try {
            const response = await fetch(`${API_BASE_URL}/auth/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
            if (response.ok) {
                setMessage(messageElement, "Perfil creado correctamente. Redirigiendo al login...", "message-success");
                form.reset();
                setTimeout(function () { window.location.href = "login.html"; }, 1500);
                return;
            }
        } catch (error) {
            // API no disponible, usar localStorage
        }

        // Fallback a localStorage
        const users = getUsers();
        const alreadyExists = users.some(function (u) { return normalizeEmail(u.user) === payload.email; });
        if (alreadyExists) {
            setMessage(messageElement, "Ese correo ya está registrado. Intenta iniciar sesión.", "message-error");
            return;
        }

        const newUser = {
            id: getNextLocalUserId(),
            name: fullName,
            firstName,
            lastNamePaternal,
            lastNameMaternal,
            user: payload.email,
            password: payload.password,
            role: "user",
            age: payload.age,
            practiceDeporte: payload.practiceDeporte === "si",
            level: payload.level,
            healthCondition: payload.healthCondition,
            infoAdicional: payload.infoAdicional,
            createdAt: new Date().toISOString()
        };

        users.push(newUser);
        saveUsers(users);

        setMessage(messageElement, "Perfil creado correctamente. Redirigiendo al login...", "message-success");
        form.reset();
        setTimeout(function () { window.location.href = "login.html"; }, 1500);
    });

    [emailInput, passwordInput, confirmPasswordInput, firstNameInput, lastNamePaternalInput, lastNameMaternalInput, ageInput, practiceDeporteInput, levelInput, healthConditionInput].forEach(function (input) {
        if (!input) return;
        input.addEventListener("input", function () { clearMessage(messageElement); clearInputErrors(form); });
    });
}

// ==================== ADMIN CRUD ====================

function handleAdminPage() {
    const tableBody = document.querySelector("#admin-users-table-body");
    if (!tableBody) return;

    const adminMessage = document.querySelector("#admin-message");
    const adminForm = document.querySelector("#user-form");
    const modal = document.querySelector("#user-modal");
    const newUserButton = document.querySelector("#new-user-button");
    const cancelBtn = document.querySelector("#cancel-user-form");
    const modalTitle = document.querySelector("#modal-title");
    const submitBtn = document.querySelector("#admin-user-form-submit");
    const searchInput = document.querySelector("#admin-search");
    const filterRole = document.querySelector("#admin-filter-role");
    const filterLevel = document.querySelector("#admin-filter-level");
    const countBadge = document.querySelector("#admin-count-badge");
    const selectAll = document.querySelector("#select-all");
    const bulkToolbar = document.querySelector("#bulk-toolbar");
    const bulkCount = document.querySelector("#bulk-count");
    const bulkLevel = document.querySelector("#bulk-level");
    const bulkApply = document.querySelector("#bulk-apply");
    const bulkCancel = document.querySelector("#bulk-cancel");
    const activitySection = document.querySelector("#admin-activity-section");
    const statsSection = document.querySelector("#admin-stats-section");

    let editingUserId = null;
    let allUsers = [];
    let filteredUsers = [];
    let selectedIds = {};
    let activityLog = [];

    function capitalize(str) { return String(str || "").trim().replace(/^\w/, function(c) { return c.toUpperCase(); }); }

    function getUserFormData() {
        return {
            id: editingUserId,
            name: capitalize(document.querySelector("#admin-name").value),
            firstName: capitalize(document.querySelector("#admin-firstName").value),
            lastNamePaternal: capitalize(document.querySelector("#admin-lastNamePaternal").value),
            lastNameMaternal: capitalize(document.querySelector("#admin-lastNameMaternal").value),
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

    function formatLevelBadge(level) {
        if (!level) return '<span class="admin-level-badge">-</span>';
        const cls = "admin-level-badge--" + level;
        const lbl = level.charAt(0).toUpperCase() + level.slice(1);
        return '<span class="admin-level-badge ' + cls + '">' + lbl + '</span>';
    }

    function addActivity(action) {
        activityLog.unshift({ action: action, time: new Date().toLocaleTimeString() });
        if (activityLog.length > 20) activityLog.pop();
        renderActivity();
    }

    function renderActivity() {
        if (!activitySection) return;
        if (activityLog.length === 0) { activitySection.innerHTML = ""; activitySection.classList.add("is-hidden"); return; }
        activitySection.classList.remove("is-hidden");
        activitySection.innerHTML = "<h4>Últimos cambios</h4><ul>" + activityLog.map(function(e) {
            return "<li><strong>" + escapeHTML(e.time) + "</strong> — " + escapeHTML(e.action) + "</li>";
        }).join("") + "</ul>";
    }

    function renderStats(users) {
        if (!statsSection) return;
        const total = users.length;
        const riesgo = users.filter(function(u) {
            const h = (u.healthCondition || u.infoAdicional || "").toLowerCase();
            return h && h !== "ninguna" && h !== "n/a" && h !== "optima" && h !== "ninguno";
        }).length;
        const niveles = { principiante: 0, intermedio: 0, avanzado: 0 };
        users.forEach(function(u) { if (niveles[u.level] !== undefined) niveles[u.level]++; });
        statsSection.innerHTML =
            '<div class="admin-stat-card"><p class="admin-stat-card__label">Total alumnos</p><p class="admin-stat-card__value">' + total + '</p></div>' +
            '<div class="admin-stat-card"><p class="admin-stat-card__label">Con observaciones de salud</p><p class="admin-stat-card__value">' + riesgo + '</p></div>' +
            '<div class="admin-stat-card"><p class="admin-stat-card__label">Distribución por nivel</p><p class="admin-stat-card__value" style="font-size:1rem">' +
            'P: ' + niveles.principiante + ' · I: ' + niveles.intermedio + ' · A: ' + niveles.avanzado + '</p></div>';
    }

    function renderUsersTable(users) {
        filteredUsers = users;
        allUsers = users;
        if (!users || users.length === 0) {
            tableBody.innerHTML = "<tr><td colspan=9>No hay usuarios registrados.</td></tr>";
            if (countBadge) countBadge.textContent = "0 usuarios";
            renderStats([]);
            return;
        }
        tableBody.innerHTML = users.map(function(user) {
            const userId = escapeHTML(user.id);
            const userName = escapeHTML(user.name);
            const userEmail = escapeHTML(user.user);
            const userCreatedAt = escapeHTML(formatDate(user.createdAt));
            const userHealth = escapeHTML(user.healthCondition || user.infoAdicional || "-");
            const isProtected = user.role === "admin" && (user.user === "admin1@sportclub.cl" || user.user === "admin1@demo.cl");
            const checked = selectedIds[user.id] ? "checked" : "";
            return '<tr class="' + (isProtected ? 'protected' : '') + '">' +
                '<td><input type="checkbox" class="user-check" data-id="' + userId + '" ' + checked + '></td>' +
                '<td>' + userId + '</td>' +
                '<td><strong>' + userName + '</strong></td>' +
                '<td>' + userEmail + '</td>' +
                '<td>' + getRoleBadge(user.role) + '</td>' +
                '<td>' + formatLevelBadge(user.level) + '</td>' +
                '<td>' + userHealth + '</td>' +
                '<td>' + userCreatedAt + '</td>' +
                '<td>' +
                (isProtected ? '<span style="font-size:.7rem;color:var(--text-secondary)">Protegido</span>' :
                '<button type="button" data-edit-id="' + userId + '" class="btn btn-ghost admin-action-button" style="padding:4px 8px;font-size:.78rem">Editar</button>' +
                ' <button type="button" data-delete-id="' + userId + '" class="btn btn-danger admin-action-button" style="padding:4px 8px;font-size:.78rem">Eliminar</button>') +
                '</td></tr>';
        }).join("");
        if (countBadge) countBadge.textContent = users.length + " usuarios";
        renderStats(users);
    }

    function applyFilters() {
        const q = (searchInput ? searchInput.value : "").toLowerCase().trim();
        const r = filterRole ? filterRole.value : "";
        const l = filterLevel ? filterLevel.value : "";
        const result = allUsers.filter(function(u) {
            if (r && u.role !== r) return false;
            if (l && u.level !== l) return false;
            if (q) {
                const name = (u.name || "").toLowerCase();
                const email = (u.user || "").toLowerCase();
                const role = u.role || "";
                if (name.indexOf(q) === -1 && email.indexOf(q) === -1 && role.indexOf(q) === -1) return false;
            }
            return true;
        });
        filteredUsers = result;
        tableBody.innerHTML = result.map(function(user) {
            const userId = escapeHTML(user.id);
            const userName = escapeHTML(user.name);
            const userEmail = escapeHTML(user.user);
            const userCreatedAt = escapeHTML(formatDate(user.createdAt));
            const userHealth = escapeHTML(user.healthCondition || user.infoAdicional || "-");
            const isProtected = user.role === "admin" && (user.user === "admin1@sportclub.cl" || user.user === "admin1@demo.cl");
            const checked = selectedIds[user.id] ? "checked" : "";
            return '<tr class="' + (isProtected ? 'protected' : '') + '">' +
                '<td><input type="checkbox" class="user-check" data-id="' + userId + '" ' + checked + '></td>' +
                '<td>' + userId + '</td>' +
                '<td><strong>' + userName + '</strong></td>' +
                '<td>' + userEmail + '</td>' +
                '<td>' + getRoleBadge(user.role) + '</td>' +
                '<td>' + formatLevelBadge(user.level) + '</td>' +
                '<td>' + userHealth + '</td>' +
                '<td>' + userCreatedAt + '</td>' +
                '<td>' +
                (isProtected ? '<span style="font-size:.7rem;color:var(--text-secondary)">Protegido</span>' :
                '<button type="button" data-edit-id="' + userId + '" class="btn btn-ghost admin-action-button" style="padding:4px 8px;font-size:.78rem">Editar</button>' +
                ' <button type="button" data-delete-id="' + userId + '" class="btn btn-danger admin-action-button" style="padding:4px 8px;font-size:.78rem">Eliminar</button>') +
                '</td></tr>';
        }).join("");
        if (countBadge) countBadge.textContent = result.length + " de " + allUsers.length + " usuarios";
    }

    function openModal(editing) {
        editingUserId = editing ? editing.id : null;
        modalTitle.textContent = editing ? "Editar Usuario" : "Nuevo Usuario";
        submitBtn.textContent = editing ? "Actualizar usuario" : "Crear usuario";
        document.querySelector("#editing-user-id").value = editing ? editing.id : "";
        if (editing) {
            document.querySelector("#admin-name").value = editing.name || "";
            document.querySelector("#admin-firstName").value = editing.firstName || "";
            document.querySelector("#admin-lastNamePaternal").value = editing.lastNamePaternal || "";
            document.querySelector("#admin-lastNameMaternal").value = editing.lastNameMaternal || "";
            document.querySelector("#admin-email").value = editing.user || "";
            document.querySelector("#admin-role").value = editing.role || "user";
            document.querySelector("#admin-birthDate").value = editing.birthDate || "";
            document.querySelector("#admin-age").value = editing.age || "";
            document.querySelector("#admin-practiceDeporte").checked = !!editing.practiceDeporte;
            document.querySelector("#admin-typeDeporte").value = editing.typeDeporte || "";
            document.querySelector("#admin-objectivePersonal").value = editing.objectivePersonal || "";
            document.querySelector("#admin-level").value = editing.level || "";
            document.querySelector("#admin-infoAdicional").value = editing.infoAdicional || "";
            document.querySelector("#admin-healthCondition").value = editing.healthCondition || editing.infoAdicional || "";
            document.querySelector("#admin-password").value = "";
            document.querySelector("#admin-confirmPassword").value = "";
        } else {
            adminForm.reset();
            document.querySelector("#editing-user-id").value = "";
        }
        clearInputErrors(adminForm);
        if (modal) modal.classList.add("is-active");
    }

    function closeModal() {
        editingUserId = null;
        if (modal) modal.classList.remove("is-active");
        clearMessage(adminMessage);
    }

    function loadAdminUsers() {
        clearMessage(adminMessage);
        allUsers = getUsers();
        applyFilters();
    }

    function handleCreateOrUpdateUser(payload) {
        clearMessage(adminMessage);
        const users = getUsers();
        
        if (editingUserId) {
            // Editar
            const user = users.find(function (u) { return String(u.id) === String(editingUserId); });
            if (!user) { setMessage(adminMessage, "Usuario no encontrado.", "message-error"); return; }
            
            user.name = payload.name;
            user.firstName = payload.firstName;
            user.lastNamePaternal = payload.lastNamePaternal;
            user.lastNameMaternal = payload.lastNameMaternal;
            user.user = payload.email;
            user.role = payload.role;
            user.birthDate = payload.birthDate;
            user.age = payload.age;
            user.practiceDeporte = payload.practiceDeporte;
            user.typeDeporte = payload.typeDeporte;
            user.objectivePersonal = payload.objectivePersonal;
            user.level = payload.level;
            user.infoAdicional = payload.infoAdicional;
            user.healthCondition = payload.healthCondition;
            if (payload.password) user.password = payload.password;
            
            saveUsers(users);
            setMessage(adminMessage, "Usuario actualizado correctamente.", "message-success");
            addActivity("Usuario actualizado: " + payload.email);
        } else {
            // Crear
            const alreadyExists = users.some(function (u) { return normalizeEmail(u.user) === payload.email; });
            if (alreadyExists) { setMessage(adminMessage, "Ese correo ya está registrado.", "message-error"); return; }
            
            const newUser = {
                id: getNextLocalUserId(),
                name: payload.name,
                firstName: payload.firstName,
                lastNamePaternal: payload.lastNamePaternal,
                lastNameMaternal: payload.lastNameMaternal,
                user: payload.email,
                role: payload.role,
                password: payload.password || "1234",
                birthDate: payload.birthDate,
                age: payload.age,
                practiceDeporte: payload.practiceDeporte,
                typeDeporte: payload.typeDeporte,
                objectivePersonal: payload.objectivePersonal,
                level: payload.level,
                infoAdicional: payload.infoAdicional,
                healthCondition: payload.healthCondition,
                createdAt: new Date().toISOString()
            };
            
            users.push(newUser);
            saveUsers(users);
            setMessage(adminMessage, "Usuario creado correctamente.", "message-success");
            addActivity("Usuario creado: " + payload.email);
        }
        
        loadAdminUsers();
        closeModal();
    }

    function handleDeleteUser(userId, user) {
        if (user.role === "admin" && (user.user === "admin1@sportclub.cl" || user.user === "admin1@demo.cl")) {
            setMessage(adminMessage, "No puedes eliminar al administrador principal.", "message-error");
            return;
        }
        if (!window.confirm("¿Eliminar a " + (user.name || "este usuario") + "?")) return;
        if (!window.confirm("Confirmación: ¿Estás seguro?")) return;
        
        const users = getUsers();
        const idx = users.findIndex(function (u) { return String(u.id) === String(userId); });
        if (idx === -1) return;
        
        users.splice(idx, 1);
        saveUsers(users);
        loadAdminUsers();
        setMessage(adminMessage, "Usuario eliminado.", "message-success");
        addActivity("Usuario eliminado: " + user.name);
    }

    function handleBulkUpdateLevel(newLevel) {
        if (!newLevel) { setMessage(adminMessage, "Selecciona un nivel para aplicar.", "message-error"); return; }
        const ids = Object.keys(selectedIds);
        let count = 0;
        const users = getUsers();
        
        ids.forEach(function (id) {
            const user = users.find(function (u) { return String(u.id) === id; });
            if (!user) return;
            if (user.role === "admin" && (user.user === "admin1@sportclub.cl" || user.user === "admin1@demo.cl")) return;
            user.level = newLevel;
            count++;
        });
        
        saveUsers(users);
        selectedIds = {};
        if (selectAll) selectAll.checked = false;
        applyFilters();
        updateBulkToolbar();
        loadAdminUsers();
        setMessage(adminMessage, "Nivel actualizado a " + count + " usuarios.", "message-success");
        addActivity("Edición masiva: " + count + " usuarios cambiados a nivel " + newLevel);
    }

    function updateBulkToolbar() {
        const ids = Object.keys(selectedIds);
        const count = ids.length;
        if (count === 0) { if (bulkToolbar) bulkToolbar.classList.add("is-hidden"); return; }
        if (bulkToolbar) bulkToolbar.classList.remove("is-hidden");
        if (bulkCount) bulkCount.textContent = count + " seleccionados";
    }

    // Event Listeners
    if (newUserButton) newUserButton.addEventListener("click", function() { openModal(null); });
    if (cancelBtn) cancelBtn.addEventListener("click", closeModal);
    if (modal) modal.addEventListener("click", function(e) { if (e.target === modal) closeModal(); });

    if (adminForm) adminForm.addEventListener("submit", function(event) {
        event.preventDefault();
        clearInputErrors(adminForm);
        clearMessage(adminMessage);
        const payload = getUserFormData();
        if (!payload.name) { setInputError(document.querySelector("#admin-name"), "El nombre es obligatorio."); return; }
        if (!payload.email) { setInputError(document.querySelector("#admin-email"), "El email es obligatorio."); return; }
        if (!editingUserId && !payload.password) { setInputError(document.querySelector("#admin-password"), "La contraseña es obligatoria."); return; }
        if (payload.password && payload.password.length < 8) { setInputError(document.querySelector("#admin-password"), "Mínimo 8 caracteres."); return; }
        if (payload.password && payload.password !== payload.confirmPassword) { setInputError(document.querySelector("#admin-confirmPassword"), "No coinciden."); return; }
        handleCreateOrUpdateUser(payload);
    });

    if (tableBody) tableBody.addEventListener("click", function(event) {
        const editBtn = event.target.closest("[data-edit-id]");
        const deleteBtn = event.target.closest("[data-delete-id]");
        if (editBtn) {
            const userId = editBtn.dataset.editId;
            const user = allUsers.find(function (u) { return String(u.id) === userId; });
            if (user) openModal(user);
            return;
        }
        if (deleteBtn) {
            const userId = deleteBtn.dataset.deleteId;
            const user = allUsers.find(function (u) { return String(u.id) === userId; });
            if (user) handleDeleteUser(userId, user);
        }
    });

    if (searchInput) searchInput.addEventListener("input", applyFilters);
    if (filterRole) filterRole.addEventListener("change", applyFilters);
    if (filterLevel) filterLevel.addEventListener("change", applyFilters);

    if (selectAll) selectAll.addEventListener("change", function() {
        const checked = selectAll.checked;
        selectedIds = {};
        if (checked) filteredUsers.forEach(function (u) { selectedIds[u.id] = true; });
        applyFilters();
        updateBulkToolbar();
    });

    if (tableBody) tableBody.addEventListener("change", function(event) {
        const cb = event.target.closest(".user-check");
        if (!cb) return;
        const id = parseInt(cb.dataset.id, 10);
        if (cb.checked) selectedIds[id] = true;
        else delete selectedIds[id];
        updateBulkToolbar();
    });

    if (bulkCancel) bulkCancel.addEventListener("click", function() {
        selectedIds = {};
        if (selectAll) selectAll.checked = false;
        applyFilters();
        updateBulkToolbar();
    });

    if (bulkApply) bulkApply.addEventListener("click", function() {
        handleBulkUpdateLevel(bulkLevel ? bulkLevel.value : "");
    });

    loadAdminUsers();
}

// ==================== PERFIL ====================

function handleProfilePage() {
    const profileForm = document.querySelector("#profile-form");
    const passwordForm = document.querySelector("#password-form");
    if (!profileForm && !passwordForm) return;

    const profileName = document.querySelector("[data-user-name]");
    const profileEmail = document.querySelector("[data-user-email]");
    const profileRole = document.querySelector("[data-user-role]");
    const profileBirthDate = document.querySelector("[data-user-birthdate]");
    const profileObjective = document.querySelector("[data-user-objective]");
    const profileMessage = document.querySelector("#profile-message");
    const passwordMessage = document.querySelector("#password-message");

    function loadProfile() {
        const loggedUser = getLoggedUser();
        if (!loggedUser) return;

        const users = getUsers();
        const user = users.find(function (u) { return normalizeEmail(u.user) === loggedUser.user; });
        if (!user) return;

        if (profileName) profileName.textContent = user.name || "-";
        if (profileEmail) profileEmail.textContent = user.user || "-";
        if (profileRole) profileRole.textContent = user.role || "-";
        if (profileBirthDate) profileBirthDate.textContent = formatDate(user.birthDate);
        if (profileObjective) profileObjective.textContent = user.objectivePersonal || "-";

        const inputs = {
            "profile-name": user.name || "",
            "profile-birthDate": user.birthDate || "",
            "profile-age": user.age || "",
            "profile-practiceDeporte": user.practiceDeporte || false,
            "profile-typeDeporte": user.typeDeporte || "",
            "profile-objectivePersonal": user.objectivePersonal || "",
            "profile-level": user.level || "",
            "profile-infoAdicional": user.infoAdicional || ""
        };

        Object.keys(inputs).forEach(function (id) {
            const input = document.querySelector("#" + id);
            if (!input) return;
            if (input.type === "checkbox") input.checked = inputs[id];
            else input.value = inputs[id];
        });
    }

    if (profileForm) {
        profileForm.addEventListener("submit", function(event) {
            event.preventDefault();
            clearInputErrors(profileForm);
            clearMessage(profileMessage);

            const loggedUser = getLoggedUser();
            if (!loggedUser) { setMessage(profileMessage, "No hay sesión activa.", "message-error"); return; }

            const users = getUsers();
            const user = users.find(function (u) { return normalizeEmail(u.user) === loggedUser.user; });
            if (!user) { setMessage(profileMessage, "Usuario no encontrado.", "message-error"); return; }

            user.name = document.querySelector("#profile-name").value.trim() || user.name;
            user.birthDate = document.querySelector("#profile-birthDate").value || user.birthDate;
            user.age = document.querySelector("#profile-age").value ? Number(document.querySelector("#profile-age").value) : user.age;
            user.practiceDeporte = document.querySelector("#profile-practiceDeporte").checked;
            user.typeDeporte = document.querySelector("#profile-typeDeporte").value.trim();
            user.objectivePersonal = document.querySelector("#profile-objectivePersonal").value.trim();
            user.level = document.querySelector("#profile-level").value;
            user.infoAdicional = document.querySelector("#profile-infoAdicional").value.trim();

            saveUsers(users);
            setMessage(profileMessage, "Perfil actualizado correctamente.", "message-success");
            
            const session = getSession();
            if (session) { session.user.name = user.name; saveSession(session); }
        });
    }

    if (passwordForm) {
        passwordForm.addEventListener("submit", function(event) {
            event.preventDefault();
            clearInputErrors(passwordForm);
            clearMessage(passwordMessage);

            const loggedUser = getLoggedUser();
            if (!loggedUser) { setMessage(passwordMessage, "No hay sesión activa.", "message-error"); return; }

            const users = getUsers();
            const user = users.find(function (u) { return normalizeEmail(u.user) === loggedUser.user; });
            if (!user) { setMessage(passwordMessage, "Usuario no encontrado.", "message-error"); return; }

            const currentPassword = document.querySelector("#current-password").value;
            const newPassword = document.querySelector("#new-password").value;
            const confirmPassword = document.querySelector("#confirm-new-password").value;

            if (!currentPassword || !newPassword || !confirmPassword) {
                setMessage(passwordMessage, "Completa todos los campos.", "message-error"); return;
            }
            if (user.password !== currentPassword) {
                setMessage(passwordMessage, "La contraseña actual es incorrecta.", "message-error"); return;
            }
            if (newPassword.length < 8) {
                setInputError(document.querySelector("#new-password"), "Mínimo 8 caracteres."); return;
            }
            if (newPassword !== confirmPassword) {
                setInputError(document.querySelector("#confirm-new-password"), "No coinciden."); return;
            }

            user.password = newPassword;
            saveUsers(users);
            setMessage(passwordMessage, "Contraseña actualizada correctamente.", "message-success");
            passwordForm.reset();
        });
    }

    loadProfile();
}

// ==================== PROTECCION DE DASHBOARD ====================

function protectDashboard() {
    const body = document.body;
    const requiredRole = body.dataset.requiredRole;
    if (!requiredRole) return;

    const user = getLoggedUser();
    if (!user) { window.location.href = "login.html"; return; }

    if (user.role !== requiredRole) {
        window.location.href = roleRedirects[user.role] || "login.html";
        return;
    }

    document.querySelectorAll("[data-logout]").forEach(function(link) {
        link.addEventListener("click", function(event) {
            event.preventDefault();
            clearSession();
            window.location.href = "login.html";
        });
    });
}

// ==================== INIT ====================

document.addEventListener("DOMContentLoaded", function() {
    protectDashboard();
    handleLoginPage();
    handleRegisterPage();
    handleAdminPage();
    handleProfilePage();
});
