document.addEventListener('DOMContentLoaded', () => {
    const API_BASE_URL = window.location.port === '3000' ? '/api' : 'http://localhost:3000/api';
    const SESSION_STORAGE_KEY = 'sportclub_session';
    const form = document.getElementById('login-form');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const emailError = document.getElementById('email-error');
    const passwordError = document.getElementById('password-error');
    const messageElement = document.getElementById('login-message');

    function resetValidation() {
        emailInput.classList.remove('input-error');
        passwordInput.classList.remove('input-error');
        emailError.classList.add('is-hidden');
        passwordError.classList.add('is-hidden');
        messageElement.className = 'message is-hidden';
        messageElement.textContent = '';
    }

    function showFieldError(input, errorElement, message) {
        input.classList.add('input-error');
        errorElement.textContent = message;
        errorElement.classList.remove('is-hidden');
    }

    function showMessage(text, isError = true) {
        messageElement.textContent = text;
        messageElement.className = `message ${isError ? 'message-error' : 'message-success'}`;
    }

    function redirectByRole(role) {
        if (role === 'admin') {
            window.location.href = 'dashboard_admin.html';
            return;
        }
        if (role === 'coach') {
            window.location.href = 'dashboard_coach.html';
            return;
        }
        window.location.href = 'dashboard_usuario.html';
    }

    function saveSession(user, token) {
        const session = {
            user: {
                name: user.name,
                user: String(user.user || '').trim().toLowerCase(),
                role: user.role
            },
            token
        };

        localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
        localStorage.setItem('authToken', token);
        localStorage.setItem('userRole', user.role);
        localStorage.setItem('userName', user.name);
    }

    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        resetValidation();

        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();
        let hasError = false;

        if (!email) {
            showFieldError(emailInput, emailError, 'Ingresa tu correo electrónico.');
            hasError = true;
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            showFieldError(emailInput, emailError, 'Ingresa un correo válido.');
            hasError = true;
        }

        if (!password) {
            showFieldError(passwordInput, passwordError, 'Ingresa tu contraseña.');
            hasError = true;
        }

        if (hasError) {
            showMessage('Corrige los errores antes de continuar.');
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();
            if (!response.ok) {
                showMessage(data.error || data.message || 'No se pudo iniciar sesión. Revisa tus credenciales.');
                return;
            }

            saveSession(data.user, data.token);
            redirectByRole(data.user.role);
        } catch (error) {
            showMessage('Error de conexión. Intenta de nuevo más tarde.');
            console.error('Login error:', error);
        }
    });
});
