const API_BASE_URL = "http://localhost:3000/api";
let serverConnected = false;

async function checkServerConnection() {
    try {
        const response = await fetch(`${API_BASE_URL}/health`);
        if (response.ok) {
            serverConnected = true;
            hideConnectionBanner();
            enableForms();
            return true;
        }
    } catch (error) {
        serverConnected = false;
    }
    
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
                    <h3>Servidor SportClub no detectado</h3>
                    <p>Para iniciar el sistema, haz doble clic en el archivo <strong>start.bat</strong> en la carpeta del proyecto.</p>
                    <p class="banner-sub">O ejecuta en la terminal: <code>cd backend && node server.js</code></p>
                </div>
                <button class="banner-retry" onclick="checkServerConnection()">Reintentar</button>
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
    setInterval(checkServerConnection, 15000);
});
