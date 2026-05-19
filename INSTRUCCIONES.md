# SportClub - Sistema de Gestion Deportiva

## Inicio Rapido (1 clic)

1. Haz doble clic en **`start.bat`**
2. Espera 3 segundos
3. El navegador se abre automaticamente

**Eso es todo.**

---

## Cuentas de Prueba

| Rol | Email | Contraseña |
|-----|-------|------------|
| Admin | `admin1@demo.cl` | `12345678` |
| Coach | `coach1@demo.cl` | `12345678` |
| User | `usuario1@demo.cl` | `12345678` |

---

## Si algo falla

### El servidor no inicia
- Abre una terminal en la carpeta `backend`
- Ejecuta: `npm install`
- Luego: `node server.js`

### La pagina no carga
- Presiona `Ctrl + F5` (hard refresh)
- Limpia el LocalStorage: F12 → Application → Clear

### Detener el servidor
- Haz doble clic en **`stop.bat`**
- O cierra la ventana negra del backend

---

## Estructura del Proyecto

```
Unidad-1-front-end-Javier-Haumada/
├── start.bat              ← INICIAR AQUI (doble clic)
├── stop.bat               ← Detener servidor
├── login.html             ← Pagina de login
├── register.html          ← Registro de usuarios
├── dashboard_admin.html   ← Panel de administrador
├── dashboard_coach.html   ← Panel de coach
├── dashboard_usuario.html ← Panel de usuario
├── js/
│   ├── init.js            ← Health check del servidor
│   └── auth.js            ← Logica de autenticacion
├── css/
│   ├── styles.css         ← Estilos principales
│   └── forms.css          ← Estilos de formularios
└── backend/
    ├── start.bat          ← Iniciar solo backend
    ├── server.js          ← Servidor API (Node.js)
    └── users.json         ← Base de datos de usuarios
```

---

## Tecnologias

- **Frontend**: HTML5, CSS3, JavaScript ES6+
- **Backend**: Node.js, Express, CORS
- **Autenticacion**: PBKDF2-SHA256, tokens UUID
- **Base de datos**: JSON file (users.json)
