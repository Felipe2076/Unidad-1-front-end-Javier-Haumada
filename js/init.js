const API_BASE_URL = "http://localhost:3000/api";
let serverConnected = false;
let retryCount = 0;
let initialCheckDone = false;
const MAX_RETRIES = 30;

async function checkServerConnection() {
    try {
        const response = await fetch(`${API_BASE_URL}/health`, { method: "GET" });
        if (response.ok) {
            serverConnected = true;
            retryCount = 0;
            hideConnectionBanner();
            enableForms();
            if (!initialCheckDone) {
                initialCheckDone = true;
                showConnectedNotification();
            }
            return true;
        }
    } catch (error) {
        serverConnected = false;
    }
    
    retryCount++;
    
    if (retryCount > 3) {
        showConnectionBanner();
        if (initialCheckDone) {
            disableForms();
        }
    }
    
    return false;
}

function showConnectionBanner() {
    let banner = document.getElementById("server-connection-banner");
    if (!banner) {
        banner = document.createElement("div");
        banner.id = "server-connection-banner";
        banner.className = "banner-error";
        banner.innerHTML = `
            <div class="banner-content">
                <div class="banner-icon">!</div>
                <div class="banner-text">
                    <h3>Servidor no detectado</h3>
                    <p>Haz doble clic en <strong>START.BAT</strong> en la carpeta del proyecto para iniciar el sistema.</p>
                    <p class="banner-sub">Reintento automatico en 5 segundos...</p>
                </div>
                <button class="banner-retry" onclick="forceReconnect()">Reintentar ahora</button>
            </div>
        `;
        document.body.insertBefore(banner, document.body.firstChild);
    }
    banner.style.display = "block";
}

function hideConnectionBanner() {
    const banner = document.getElementById("server-connection-banner");
    if (banner) {
        banner.style.display = "none";
    }
}

function showConnectedNotification() {
    let existing = document.getElementById("connected-notification");
    if (existing) return;
    
    const notif = document.createElement("div");
    notif.id = "connected-notification";
    notif.innerHTML = `
        <div class="notif-content">
            <span class="notif-icon">✓</span>
            <span class="notif-text">Servidor conectado - Sistema listo</span>
        </div>
    `;
    document.body.insertBefore(notif, document.body.firstChild);
    
    setTimeout(() => {
        notif.style.opacity = "0";
        notif.style.transform = "translateY(-100%)";
        setTimeout(() => notif.remove(), 500);
    }, 2000);
}

function forceReconnect() {
    retryCount = 0;
    hideConnectionBanner();
    enableForms();
    checkServerConnection();
}

function disableForms() {
    const forms = document.querySelectorAll("form");
    forms.forEach(form => {
        form.style.pointerEvents = "none";
        form.style.opacity = "0.4";
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
    enableForms();
    checkServerConnection();
    setInterval(checkServerConnection, 5000);
});
