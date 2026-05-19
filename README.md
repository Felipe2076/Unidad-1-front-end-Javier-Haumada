# SportClub - Sistema de Gestion Deportiva

Sistema web completo para gestion de un club deportivo con autenticacion, dashboards por rol y CRUD de usuarios.

## Acceso Directo

**Ingresa directamente desde:** https://felipe2076.github.io/Unidad-1-front-end-Javier-Haumada/login.html

No necesitas instalar nada, ni ejecutar comandos, ni configurar servidores. Solo abre el link y funciona.

---

## Cuentas de Prueba

| Rol | Email | Contraseña |
|-----|-------|------------|
| Admin | `admin1@demo.cl` | `12345678` |
| Coach | `coach1@demo.cl` | `12345678` |
| User | `usuario1@demo.cl` | `12345678` |

Tambien disponibles con `@sportclub.cl` y contraseña `1234`.

---

## Caracteristicas

- **Funciona inmediatamente**: Solo abre el link y todo esta listo
- **Autenticacion segura**: Login con validacion de credenciales
- **Dashboards por rol**: Interfaz diferente para admin, coach y usuario
- **CRUD completo**: Crear, leer, actualizar y eliminar usuarios (admin)
- **Perfil editable**: Modificar datos personales y cambiar contraseña
- **Registro funcional**: Nuevos usuarios pueden registrarse y acceder
- **Diseño responsive**: Funciona en desktop y movil

---

## Como Usar

1. Abre el link: https://felipe2076.github.io/Unidad-1-front-end-Javier-Haumada/login.html
2. Ingresa con una de las cuentas de prueba
3. Navega por el dashboard segun tu rol
4. Para el admin: gestiona usuarios, crea, edita y elimina
5. Para todos: edita tu perfil y cambia tu contraseña

---

## Estructura del Proyecto

```
Unidad-1-front-end-Javier-Haumada/
├── login.html                   ← Pagina de login
├── register.html                ← Registro de usuarios
├── recover.html                 ← Recuperar contraseña
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

## Tecnologias

- **Frontend**: HTML5, CSS3, JavaScript ES6+
- **Almacenamiento**: localStorage del navegador
- **Backend**: Node.js, Express (para desarrollo local)
- **Diseño**: Responsive, mobile-first

---

## Si algo falla

### La pagina no carga
- Presiona `Ctrl + F5` (hard refresh)
- Limpia el cache del navegador

### No puedo iniciar sesion
- Verifica que el email y contraseña esten correctos
- Prueba con: `admin1@demo.cl` / `12345678`

### Quiero reiniciar todo
- F12 → Application → Local Storage → Clear All
- Recarga la pagina con `Ctrl + F5`

---

## Evidencias de prueba

Fecha de verificacion: 13/05/2026.

- Login correcto con usuario demo y redireccion segun rol.
- CRUD de usuarios disponible desde el dashboard de administrador.
- Perfil de usuario editable y cambio de contraseña funcional.
- Registro de nuevos usuarios con validacion completa.
- Sistema funciona completamente desde GitHub Pages sin configuracion adicional.

Evidencia documentada en el repositorio:
- `docs/evidencias/evidencia-entrega.md`
- `docs/evidencias/prueba-login-brave.png`
