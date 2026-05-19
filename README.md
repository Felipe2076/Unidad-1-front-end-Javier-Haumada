# SportClub - Sistema de Gestion Deportiva

Proyecto full-stack para un sistema web de club deportivo con autenticacion, dashboards por rol y CRUD de usuarios.

## Inicio Rapido (1 clic)

### Primera vez:
1. Haz doble clic en **`setup.bat`** (solo la primera vez)
2. Espera a que termine la instalacion

### Cada vez que quieras usar el sistema:
1. Haz doble clic en **`START.BAT`**
2. Espera 5 segundos
3. El navegador se abre automaticamente

**Eso es todo.** No necesitas abrir terminales ni escribir comandos.

---

## Cuentas de Prueba

| Rol | Email | Contraseña |
|-----|-------|------------|
| Admin | `admin1@demo.cl` | `12345678` |
| Coach | `coach1@demo.cl` | `12345678` |
| User | `usuario1@demo.cl` | `12345678` |

---

## Archivos de Automatizacion

| Archivo | Funcion |
|---------|---------|
| `START.BAT` | Inicia todo el sistema con 1 clic |
| `STOP.BAT` | Detiene el servidor |
| `setup.bat` | Instalacion inicial (solo primera vez) |
| `crear-accesos-directos.bat` | Crea shortcuts en el escritorio |

---

## Estructura del Proyecto

```
Unidad-1-front-end-Javier-Haumada/
├── START.BAT                    ← INICIAR AQUI (doble clic)
├── STOP.BAT                     ← Detener servidor
├── setup.bat                    ← Instalacion inicial
├── crear-accesos-directos.bat   ← Crear shortcuts en escritorio
├── login.html                   ← Pagina de login
├── register.html                ← Registro de usuarios
├── recover.html                 ← Recuperar contraseña
├── dashboard_admin.html         ← Panel de administrador
├── dashboard_coach.html         ← Panel de coach
├── dashboard_usuario.html       ← Panel de usuario
├── js/
│   ├── init.js                  ← Health check + auto-reconexion
│   └── auth.js                  ← Logica de autenticacion API
├── css/
│   ├── styles.css               ← Estilos principales
│   └── forms.css                ← Estilos de formularios
└── backend/
    ├── server.js                ← Servidor API (Node.js/Express)
    └── users.json               ← Base de datos de usuarios
```

---

## Tecnologias

- **Frontend**: HTML5, CSS3, JavaScript ES6+
- **Backend**: Node.js, Express, CORS
- **Autenticacion**: PBKDF2-SHA256, tokens UUID
- **Base de datos**: JSON file (users.json)

---

## Caracteristicas

- **Autenticacion segura**: Login con hash de contraseñas y tokens de sesion
- **Dashboards por rol**: Interfaz diferente para admin, coach y usuario
- **CRUD completo**: Crear, leer, actualizar y eliminar usuarios (admin)
- **Perfil editable**: Modificar datos personales y cambiar contraseña
- **Auto-reconexion**: El frontend detecta automaticamente cuando el backend esta disponible
- **Inicio automatizado**: Scripts .bat para iniciar/detener sin comandos

---

## Si algo falla

### El servidor no inicia
- Ejecuta `setup.bat` para reinstalar dependencias
- O abre una terminal en `backend` y ejecuta: `npm install`

### La pagina no carga
- Presiona `Ctrl + F5` (hard refresh)
- Limpia el LocalStorage: F12 → Application → Clear

### Detener el servidor
- Haz doble clic en `STOP.BAT`
- O cierra la ventana negra del backend

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
