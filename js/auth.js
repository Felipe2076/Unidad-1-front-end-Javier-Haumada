const API_BASE_URL = "http://localhost:3000/api";
const SESSION_STORAGE_KEY = "sportclub_session";

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

        try {
            const result = await apiRequest("/auth/login", "POST", { email: inputEmail, password: inputPassword });
            
            if (result.user && result.token) {
                const userData = result.user;
                saveSession({ 
                    user: { 
                        name: userData.name, 
                        user: normalizeEmail(userData.user), 
                        role: userData.role 
                    }, 
                    token: result.token 
                });
                setMessage(messageElement, "Has ingresado correctamente.", "message-success");
                window.setTimeout(function () { redirectToDashboard(userData.role); }, 500);
            }
        } catch (error) {
            setMessage(messageElement, error.message || "Credenciales incorrectas.", "message-error");
        }
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

        try {
            const result = await apiRequest("/auth/register", "POST", payload);
            
            if (result.user && result.token) {
                setMessage(messageElement, "Perfil creado correctamente. Redirigiendo al login...", "message-success");
                form.reset();
                window.setTimeout(function () {
                    window.location.href = "login.html";
                }, 1500);
            }
        } catch (error) {
            setMessage(messageElement, error.message || "Error al registrarte. Revisa los datos.", "message-error");
        }
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
    var tableBody = document.querySelector("#admin-users-table-body");
    if (!tableBody) return;

    var adminMessage = document.querySelector("#admin-message");
    var adminForm = document.querySelector("#user-form");
    var modal = document.querySelector("#user-modal");
    var newUserButton = document.querySelector("#new-user-button");
    var cancelBtn = document.querySelector("#cancel-user-form");
    var modalTitle = document.querySelector("#modal-title");
    var submitBtn = document.querySelector("#admin-user-form-submit");
    var searchInput = document.querySelector("#admin-search");
    var filterRole = document.querySelector("#admin-filter-role");
    var filterLevel = document.querySelector("#admin-filter-level");
    var countBadge = document.querySelector("#admin-count-badge");
    var selectAll = document.querySelector("#select-all");
    var bulkToolbar = document.querySelector("#bulk-toolbar");
    var bulkCount = document.querySelector("#bulk-count");
    var bulkLevel = document.querySelector("#bulk-level");
    var bulkApply = document.querySelector("#bulk-apply");
    var bulkCancel = document.querySelector("#bulk-cancel");
    var resetBtn = document.querySelector("#reset-db-btn");
    var confirmReset = document.querySelector("#confirm-reset-btn");
    var cancelReset = document.querySelector("#cancel-reset-btn");
    var activitySection = document.querySelector("#admin-activity-section");
    var statsSection = document.querySelector("#admin-stats-section");

    var editingUserId = null;
    var allUsers = [];
    var filteredUsers = [];
    var selectedIds = {};
    var activityLog = [];

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
        var cls = "admin-level-badge--" + level;
        var lbl = level.charAt(0).toUpperCase() + level.slice(1);
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
        var total = users.length;
        var riesgo = users.filter(function(u) {
            var h = (u.healthCondition || u.infoAdicional || "").toLowerCase();
            return h && h !== "ninguna" && h !== "n/a" && h !== "optima" && h !== "ninguno" && h !== "sin lesiones declaradas." && h !== "sin restricciones medicas.";
        }).length;
        var niveles = { principiante: 0, intermedio: 0, avanzado: 0 };
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
            var userId = escapeHTML(user.id);
            var userName = escapeHTML(user.name);
            var userEmail = escapeHTML(user.user);
            var userCreatedAt = escapeHTML(formatDate(user.createdAt));
            var userHealth = escapeHTML(user.healthCondition || user.infoAdicional || "-");
            var isProtected = user.role === "admin" && (user.user === "admin1@sportclub.cl" || user.user === "admin1@demo.cl");
            var checked = selectedIds[user.id] ? "checked" : "";
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
        var q = (searchInput ? searchInput.value : "").toLowerCase().trim();
        var r = filterRole ? filterRole.value : "";
        var l = filterLevel ? filterLevel.value : "";
        var result = allUsers.filter(function(u) {
            if (r && u.role !== r) return false;
            if (l && u.level !== l) return false;
            if (q) {
                var name = (u.name || "").toLowerCase();
                var email = (u.user || "").toLowerCase();
                var role = u.role || "";
                if (name.indexOf(q) === -1 && email.indexOf(q) === -1 && role.indexOf(q) === -1) return false;
            }
            return true;
        });
        filteredUsers = result;
        tableBody.innerHTML = result.map(function(user) {
            var userId = escapeHTML(user.id);
            var userName = escapeHTML(user.name);
            var userEmail = escapeHTML(user.user);
            var userCreatedAt = escapeHTML(formatDate(user.createdAt));
            var userHealth = escapeHTML(user.healthCondition || user.infoAdicional || "-");
            var isProtected = user.role === "admin" && (user.user === "admin1@sportclub.cl" || user.user === "admin1@demo.cl");
            var checked = selectedIds[user.id] ? "checked" : "";
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

    async function loadAdminUsers() {
        clearMessage(adminMessage);
        try {
            const result = await apiRequest("/users", "GET", null, true);
            allUsers = result.users || [];
            applyFilters();
        } catch (error) {
            setMessage(adminMessage, error.message || "No se pudo cargar la lista.", "message-error");
        }
    }

    async function handleCreateOrUpdateUser(payload) {
        clearMessage(adminMessage);
        try {
            let result;
            if (editingUserId) {
                result = await apiRequest(`/users/${editingUserId}`, "PUT", payload, true);
            } else {
                result = await apiRequest("/users", "POST", payload, true);
            }
            await loadAdminUsers();
            var action = editingUserId ? "actualizado" : "creado";
            setMessage(adminMessage, "Usuario " + action + " correctamente.", "message-success");
            addActivity("Usuario " + action + ": " + payload.email);
            closeModal();
        } catch (error) {
            setMessage(adminMessage, error.message || "Error al guardar el usuario.", "message-error");
        }
    }

    async function handleDeleteUser(userId, user) {
        if (user.role === "admin" && (user.user === "admin1@sportclub.cl" || user.user === "admin1@demo.cl")) {
            setMessage(adminMessage, "No puedes eliminar al administrador principal.", "message-error");
            return;
        }
        if (!window.confirm("¿Eliminar a " + (user.name || "este usuario") + "? Esta acción no se puede deshacer.")) return;
        if (!window.confirm("Confirmación: ¿Estás seguro?")) return;
        
        try {
            await apiRequest(`/users/${userId}`, "DELETE", null, true);
            await loadAdminUsers();
            setMessage(adminMessage, "Usuario eliminado.", "message-success");
            addActivity("Usuario eliminado: " + user.email);
        } catch (error) {
            setMessage(adminMessage, error.message || "Error al eliminar el usuario.", "message-error");
        }
    }

    async function handleBulkUpdateLevel(newLevel) {
        if (!newLevel) { 
            setMessage(adminMessage, "Selecciona un nivel para aplicar.", "message-error"); 
            return; 
        }
        var ids = Object.keys(selectedIds);
        var count = 0;
        
        for (var i = 0; i < ids.length; i++) {
            var id = ids[i];
            var user = allUsers.find(function(u) { return String(u.id) === id; });
            if (!user) continue;
            if (user.role === "admin" && (user.user === "admin1@sportclub.cl" || user.user === "admin1@demo.cl")) continue;
            
            try {
                await apiRequest(`/users/${id}`, "PUT", { level: newLevel }, true);
                count++;
            } catch (error) {
                console.error("Error updating user " + id, error);
            }
        }
        
        selectedIds = {};
        if (selectAll) selectAll.checked = false;
        applyFilters();
        updateBulkToolbar();
        await loadAdminUsers();
        setMessage(adminMessage, "Nivel actualizado a " + count + " usuarios.", "message-success");
        addActivity("Edición masiva: " + count + " usuarios cambiados a nivel " + newLevel);
    }

    // === EVENT LISTENERS ===

    if (newUserButton) newUserButton.addEventListener("click", function() { openModal(null); });
    if (cancelBtn) cancelBtn.addEventListener("click", closeModal);
    if (modal) modal.addEventListener("click", function(e) { if (e.target === modal) closeModal(); });

    if (adminForm) adminForm.addEventListener("submit", async function(event) {
        event.preventDefault();
        clearInputErrors(adminForm);
        clearMessage(adminMessage);
        var payload = getUserFormData();
        if (!payload.name) { setInputError(document.querySelector("#admin-name"), "El nombre es obligatorio."); return; }
        if (!payload.email) { setInputError(document.querySelector("#admin-email"), "El email es obligatorio."); return; }
        if (!editingUserId && !payload.password) { setInputError(document.querySelector("#admin-password"), "La contraseña es obligatoria."); return; }
        if (payload.password && payload.password.length < 8) { setInputError(document.querySelector("#admin-password"), "Mínimo 8 caracteres."); return; }
        if (payload.password && payload.password !== payload.confirmPassword) { setInputError(document.querySelector("#admin-confirmPassword"), "No coinciden."); return; }
        await handleCreateOrUpdateUser(payload);
    });

    if (tableBody) tableBody.addEventListener("click", async function(event) {
        var editBtn = event.target.closest("[data-edit-id]");
        var deleteBtn = event.target.closest("[data-delete-id]");
        if (editBtn) {
            var userId = editBtn.dataset.editId;
            var user = allUsers.find(function(u) { return String(u.id) === userId; });
            if (user) {
                openModal(user);
            }
            return;
        }
        if (deleteBtn) {
            var userId = deleteBtn.dataset.deleteId;
            var user = allUsers.find(function(u) { return String(u.id) === userId; });
            if (user) {
                await handleDeleteUser(userId, user);
            }
        }
    });

    // Search & filters
    if (searchInput) searchInput.addEventListener("input", applyFilters);
    if (filterRole) filterRole.addEventListener("change", applyFilters);
    if (filterLevel) filterLevel.addEventListener("change", applyFilters);

    // Select all
    if (selectAll) selectAll.addEventListener("change", function() {
        var checked = selectAll.checked;
        selectedIds = {};
        if (checked) {
            filteredUsers.forEach(function(u) { selectedIds[u.id] = true; });
        }
        applyFilters();
        updateBulkToolbar();
    });

    // Individual checkboxes via delegation
    if (tableBody) tableBody.addEventListener("change", function(event) {
        var cb = event.target.closest(".user-check");
        if (!cb) return;
        var id = parseInt(cb.dataset.id, 10);
        if (cb.checked) selectedIds[id] = true;
        else delete selectedIds[id];
        updateBulkToolbar();
    });

    function updateBulkToolbar() {
        var ids = Object.keys(selectedIds);
        var count = ids.length;
        if (count === 0) { if (bulkToolbar) bulkToolbar.classList.add("is-hidden"); return; }
        if (bulkToolbar) { bulkToolbar.classList.remove("is-hidden"); }
        if (bulkCount) bulkCount.textContent = count + " seleccionados";
    }

    if (bulkCancel) bulkCancel.addEventListener("click", function() {
        selectedIds = {};
        if (selectAll) selectAll.checked = false;
        applyFilters();
        updateBulkToolbar();
    });

    if (bulkApply) bulkApply.addEventListener("click", function() {
        var newLevel = bulkLevel ? bulkLevel.value : "";
        handleBulkUpdateLevel(newLevel);
    });

    // Reset database
    if (resetBtn) resetBtn.addEventListener("click", function() {
        document.querySelector("#admin-danger-section").classList.remove("is-hidden");
    });
    if (cancelReset) cancelReset.addEventListener("click", function() {
        document.querySelector("#admin-danger-section").classList.add("is-hidden");
    });
    if (confirmReset) confirmReset.addEventListener("click", async function() {
        setMessage(adminMessage, "Funcionalidad deshabilitada en modo API. Contacta al administrador del backend.", "message-error");
        document.querySelector("#admin-danger-section").classList.add("is-hidden");
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

    async function loadProfile() {
        try {
            const result = await apiRequest("/auth/me", "GET", null, true);
            const user = result.user;
            if (profileName) profileName.textContent = user.name || "-";
            if (profileEmail) profileEmail.textContent = user.user || "-";
            if (profileRole) profileRole.textContent = user.role || "-";
            if (profileBirthDate) profileBirthDate.textContent = formatDate(user.birthDate);
            if (profileObjective) profileObjective.textContent = user.objectivePersonal || "-";

            const profileInputs = {
                "profile-name": user.name || "",
                "profile-birthDate": user.birthDate || "",
                "profile-age": user.age || "",
                "profile-practiceDeporte": user.practiceDeporte || false,
                "profile-typeDeporte": user.typeDeporte || "",
                "profile-objectivePersonal": user.objectivePersonal || "",
                "profile-level": user.level || "",
                "profile-infoAdicional": user.infoAdicional || ""
            };

            Object.keys(profileInputs).forEach(function(id) {
                const input = document.querySelector("#" + id);
                if (!input) return;
                if (input.type === "checkbox") {
                    input.checked = profileInputs[id];
                } else {
                    input.value = profileInputs[id];
                }
            });
        } catch (error) {
            setMessage(profileMessage, "Error al cargar el perfil: " + error.message, "message-error");
        }
    }

    profileForm.addEventListener("submit", async function(event) {
        event.preventDefault();
        clearInputErrors(profileForm);
        clearMessage(profileMessage);

        const payload = {
            name: document.querySelector("#profile-name").value.trim(),
            birthDate: document.querySelector("#profile-birthDate").value,
            age: document.querySelector("#profile-age").value ? Number(document.querySelector("#profile-age").value) : null,
            practiceDeporte: document.querySelector("#profile-practiceDeporte").checked,
            typeDeporte: document.querySelector("#profile-typeDeporte").value.trim(),
            objectivePersonal: document.querySelector("#profile-objectivePersonal").value.trim(),
            level: document.querySelector("#profile-level").value,
            infoAdicional: document.querySelector("#profile-infoAdicional").value.trim()
        };

        if (!payload.name) {
            setInputError(document.querySelector("#profile-name"), "El nombre es obligatorio.");
            return;
        }

        try {
            const result = await apiRequest("/auth/me", "PUT", payload, true);
            setMessage(profileMessage, "Perfil actualizado correctamente.", "message-success");
            
            const session = getSession();
            if (session) {
                session.user.name = result.user.name;
                saveSession(session);
            }
        } catch (error) {
            setMessage(profileMessage, error.message || "Error al actualizar el perfil.", "message-error");
        }
    });

    passwordForm.addEventListener("submit", async function(event) {
        event.preventDefault();
        clearInputErrors(passwordForm);
        clearMessage(passwordMessage);

        const currentPassword = document.querySelector("#current-password").value;
        const newPassword = document.querySelector("#new-password").value;
        const confirmPassword = document.querySelector("#confirm-new-password").value;

        if (!currentPassword || !newPassword || !confirmPassword) {
            setMessage(passwordMessage, "Completa todos los campos de contraseña.", "message-error");
            return;
        }

        if (newPassword.length < 8) {
            setInputError(document.querySelector("#new-password"), "La nueva contraseña debe tener al menos 8 caracteres.");
            return;
        }

        if (newPassword !== confirmPassword) {
            setInputError(document.querySelector("#confirm-new-password"), "Las contraseñas no coinciden.");
            return;
        }

        try {
            await apiRequest("/auth/me/password", "PUT", {
                currentPassword,
                newPassword,
                confirmPassword
            }, true);
            setMessage(passwordMessage, "Contraseña actualizada correctamente.", "message-success");
            passwordForm.reset();
        } catch (error) {
            setMessage(passwordMessage, error.message || "Error al cambiar la contraseña.", "message-error");
        }
    });

    loadProfile();
}

function handleCoachPage() {
    const reservationsList = document.querySelector("#coach-reservations-list");
    if (!reservationsList) return;

    const messageElement = document.querySelector("#coach-message");

    async function loadReservations() {
        try {
            const result = await apiRequest("/reservations", "GET", null, true);
            const reservations = result.reservations || [];
            
            if (reservations.length === 0) {
                reservationsList.innerHTML = "<p>No hay reservas registradas.</p>";
                return;
            }

            reservationsList.innerHTML = reservations.map(function(res) {
                return '<div class="reservation-item">' +
                    '<strong>' + escapeHTML(res.user_name || "Usuario") + '</strong>' +
                    '<span>' + escapeHTML(res.class_name || "Clase") + '</span>' +
                    '<span class="reservation-date">' + formatDate(res.date) + '</span>' +
                    '</div>';
            }).join("");
        } catch (error) {
            setMessage(messageElement, "Error al cargar reservas: " + error.message, "message-error");
        }
    }

    loadReservations();
}

function handleUserDashboard() {
    const reservationsSection = document.querySelector("#user-reservations");
    const progressSection = document.querySelector("#user-progress");
    
    if (!reservationsSection && !progressSection) return;

    const messageElement = document.querySelector("#user-message");

    async function loadDashboard() {
        try {
            if (reservationsSection) {
                const result = await apiRequest("/reservations", "GET", null, true);
                const reservations = result.reservations || [];
                
                if (reservations.length === 0) {
                    reservationsSection.innerHTML = "<p>No tienes reservas activas.</p>";
                } else {
                    reservationsSection.innerHTML = reservations.map(function(res) {
                        return '<div class="reservation-item">' +
                            '<strong>' + escapeHTML(res.class_name || "Clase") + '</strong>' +
                            '<span>' + formatDate(res.date) + '</span>' +
                            '</div>';
                    }).join("");
                }
            }

            if (progressSection) {
                const result = await apiRequest("/progress", "GET", null, true);
                const progress = result.progress || {};
                
                const percentage = progress.percentage || 0;
                progressSection.innerHTML = 
                    '<div class="progress-donut--hero" style="--pct: ' + percentage + '">' +
                    '<div class="progress-donut__label">' +
                    '<strong>' + percentage + '%</strong>' +
                    '<small>Progreso</small>' +
                    '</div></div>';
            }
        } catch (error) {
            setMessage(messageElement, "Error al cargar el dashboard: " + error.message, "message-error");
        }
    }

    loadDashboard();
}

function protectDashboard() {
    const body = document.body;
    const requiredRole = body.dataset.requiredRole;
    if (!requiredRole) return;

    const user = getLoggedUser();
    if (!user) {
        window.location.href = "login.html";
        return;
    }

    if (user.role !== requiredRole && !(requiredRole === "admin" && user.role === "admin")) {
        window.location.href = roleRedirects[user.role] || "login.html";
        return;
    }

    const logoutLinks = document.querySelectorAll("[data-logout]");
    logoutLinks.forEach(function(link) {
        link.addEventListener("click", function(event) {
            event.preventDefault();
            clearSession();
            window.location.href = "login.html";
        });
    });
}

document.addEventListener("DOMContentLoaded", function() {
    protectDashboard();
    handleLoginPage();
    handleRegisterPage();
    handleAdminPage();
    handleProfilePage();
    handleCoachPage();
    handleUserDashboard();
});
