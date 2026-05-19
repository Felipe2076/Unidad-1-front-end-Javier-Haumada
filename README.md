# SportClub - Sistema de Gestion Deportiva

Proyecto full-stack para un sistema web de club deportivo con autenticacion, dashboards por rol y CRUD de usuarios.

## Inicio Rapido

**Doble clic en `INICIAR-SPORTCLUB.bat`**

El script:
1. Inicia el servidor backend automaticamente
2. Abre tu navegador en `http://localhost:3000/login.html`
3. Todo funciona sin errores de conexion

---

## Cuentas de Prueba

| Rol | Email | Contraseña |
|-----|-------|------------|
| Admin | `admin1@demo.cl` | `12345678` |
| Coach | `coach1@demo.cl` | `12345678` |
| User | `usuario1@demo.cl` | `12345678` |

Tambien disponibles con `@sportclub.cl` y contraseña `1234`.

---

## Importante: Como Acceder

**SIEMPRE usar: `http://localhost:3000/login.html`**

No usar GitHub Pages para demostraciones. El sistema esta diseñado para funcionar con el backend local.

---

## Estructura del Proyecto

```
Unidad-1-front-end-Javier-Haumada/
├── INICIAR-SPORTCLUB.bat        ← INICIAR AQUI (doble clic)
├── login.html                   ← Pagina de login
├── register.html                ← Registro de usuarios
├── dashboard_admin.html         ← Panel de administrador
├── dashboard_coach.html         ← Panel de coach
├── dashboard_usuario.html       ← Panel de usuario
├── js/
│   └── auth.js                  ← Logica completa de autenticacion
├── css/
│   ├── styles.css               ← Estilos principales
│   └── forms.css                ← Estilos de formularios
└── backend/
    ├── server.js                ← Servidor API (Node.js/Express)
    └── users.json               ← Base de datos de usuarios
```

---

## Caracteristicas

- **Backend integrado**: El servidor Node.js sirve el frontend y la API en el mismo puerto
- **Sin errores CORS**: Todo corre en `localhost:3000`, mismo origen
- **Autenticacion segura**: Login con hash PBKDF2-SHA256 y tokens de sesion
- **Dashboards por rol**: Interfaz diferente para admin, coach y usuario
- **CRUD completo**: Crear, leer, actualizar y eliminar usuarios (admin)
- **Perfil editable**: Modificar datos personales y cambiar contraseña
- **Indicador visual**: Muestra si estas conectado al backend

---

## Si algo falla

### El servidor no inicia
- Abre una terminal en `backend` y ejecuta: `npm install`
- Luego: `node server.js`

### No puedo iniciar sesion
- Verifica que el email y contraseña esten correctos
- Prueba con: `admin1@demo.cl` / `12345678`

### Quiero reiniciar todo
- F12 → Application → Local Storage → Clear All
- Recarga la pagina con `Ctrl + F5`

---

## Tecnologias

- **Frontend**: HTML5, CSS3, JavaScript ES6+
- **Backend**: Node.js, Express, CORS
- **Autenticacion**: PBKDF2-SHA256, tokens UUID
- **Base de datos**: JSON file (users.json)

---

## Evidencias de prueba

Fecha de verificacion: 13/05/2026.

- Login correcto con usuario demo y redireccion segun rol.
- CRUD de usuarios disponible desde el dashboard de administrador.
- Perfil de usuario editable y cambio de contraseña conectado a la API.
- Backend endurecido con contraseñas hasheadas, sesiones con expiracion, validacion de roles y proteccion contra intentos repetidos de login.

Evidencia documentada en el repositorio:
- `docs/evidencias/evidencia-entrega.md`
- `docs/evidencias/prueba-login-brave.png`
