# SportClub - Sistema de Gestion Deportiva

Proyecto full-stack para un sistema web de club deportivo con autenticacion, dashboards por rol y CRUD de usuarios.

## Inicio Rapido

**Solo abre `login.html` en tu navegador.**

No necesitas instalar nada, ni ejecutar comandos, ni servidores. Todo funciona automaticamente con almacenamiento local.

---

## Cuentas de Prueba

| Rol | Email | Contraseña |
|-----|-------|------------|
| Admin | `admin1@demo.cl` | `12345678` |
| Coach | `coach1@demo.cl` | `12345678` |
| User | `usuario1@demo.cl` | `12345678` |

Tambien disponibles con `@sportclub.cl` y contraseña `1234`.

---

## Estructura del Proyecto

```
Unidad-1-front-end-Javier-Haumada/
├── login.html                   ← Pagina de login (ABRIR AQUI)
├── register.html                ← Registro de usuarios
├── recover.html                 ← Recuperar contraseña
├── dashboard_admin.html         ← Panel de administrador
├── dashboard_coach.html         ← Panel de coach
├── dashboard_usuario.html       ← Panel de usuario
├── js/
│   ── auth.js                  ← Logica completa de autenticacion
└── css/
    ├── styles.css               ← Estilos principales
    └── forms.css                ← Estilos de formularios
```

---

## Caracteristicas

- **Funciona sin servidor**: Todo se almacena en localStorage del navegador
- **Autenticacion segura**: Login con validacion de credenciales
- **Dashboards por rol**: Interfaz diferente para admin, coach y usuario
- **CRUD completo**: Crear, leer, actualizar y eliminar usuarios (admin)
- **Perfil editable**: Modificar datos personales y cambiar contraseña
- **Registro funcional**: Nuevos usuarios pueden registrarse y acceder inmediatamente

---

## Si algo falla

### La pagina no carga
- Presiona `Ctrl + F5` (hard refresh)
- Limpia el LocalStorage: F12 → Application → Local Storage → Clear

### No puedo iniciar sesion
- Verifica que el email y contraseña esten correctos
- Prueba con: `admin1@demo.cl` / `12345678`

### Quiero reiniciar todo
- F12 → Application → Local Storage → Clear All
- Recarga la pagina con `Ctrl + F5`

---

## Tecnologias

- **Frontend**: HTML5, CSS3, JavaScript ES6+
- **Almacenamiento**: localStorage del navegador
- **Diseño**: Responsive, mobile-first

---

## Evidencias de prueba

Fecha de verificacion: 13/05/2026.

- Login correcto con usuario demo y redireccion segun rol.
- CRUD de usuarios disponible desde el dashboard de administrador.
- Perfil de usuario editable y cambio de contraseña funcional.
- Registro de nuevos usuarios con validacion completa.

Evidencia documentada en el repositorio:
- `docs/evidencias/evidencia-entrega.md`
- `docs/evidencias/prueba-login-brave.png`
