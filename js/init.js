const API_BASE_URL = "http://localhost:3000/api";
let serverConnected = false;
let retryCount = 0;
const MAX_RETRIES = 20;

async function checkServerConnection() {
    try {
        const response = await fetch(`${API_BASE_URL}/health`);
        if (response.ok) {
            if (!serverConnected) {
                serverConnected = true;
                retryCount = 0;
                hideConnectionBanner();
                enableForms();
                showConnectedNotification();
            }
            return true;
        }
    } catch (error) {
        serverConnected = false;
    }
    
    retryCount++;
    showConnectionBanner();
    disableForms();
    return false;
}

function showConnectionBanner() {
    let banner = document.getElementById("server-connection-banner");
    if (!banner) {
        banner = document.createElement("div");
        banner.id = "server-connection-banner";
        banner.innerHTML = `
            <div class="banner-content">
                <div class="banner-spinner"></div>
                <div class="banner-text">
                    <h3>Conectando con el servidor SportClub...</h3>
                    <p>Si el servidor no inicia automaticamente, haz doble clic en <strong>start.bat</strong> en la carpeta del proyecto.</p>
                    <p class="banner-sub">Reintento automatico <span id="retry-count">0</span>/${MAX_RETRIES}</p>
                </div>
                <button class="banner-retry" onclick="forceReconnect()">Reintentar ahora</button>
            </div>
        `;
        document.body.insertBefore(banner, document.body.firstChild);
    }
    banner.style.display = "block";
    
    const retryEl = document.getElementById("retry-count");
    if (retryEl) {
        retryEl.textContent = retryCount;
    }
}

function hideConnectionBanner() {
    const banner = document.getElementById("server-connection-banner");
    if (banner) {
        banner.style.display = "none";
    }
}

function showConnectedNotification() {
    let notif = document.getElementById("connected-notification");
    if (!notif) {
        notif = document.createElement("div");
        notif.id = "connected-notification";
        notif.innerHTML = `
            <div class="notif-content">
                <span class="notif-icon">✓</span>
                <span class="notif-text">Servidor conectado!</span>
            </div>
        `;
        document.body.insertBefore(notif, document.body.firstChild);
        
        setTimeout(() => {
            notif.style.opacity = "0";
            notif.style.transform = "translateY(-100%)";
            setTimeout(() => notif.remove(), 500);
        }, 3000);
    }
}

function forceReconnect() {
    retryCount = 0;
    checkServerConnection();
}

function disableForms() {
    const forms = document.querySelectorAll("form");
    forms.forEach(form => {
        form.style.pointerEvents = "none";
        form.style.opacity = "0.5";
    });
}

function enableForms() {
    const forms = document.querySelectorAll("form");
    forms.forEach(form => {
        form.style.pointerEvents = "auto";
        form.style.opacity = "1";
    });
}

function isServerConnected() {
    return serverConnected;
}

document.addEventListener("DOMContentLoaded", () => {
    checkServerConnection();
    setInterval(checkServerConnection, 5000);
});
