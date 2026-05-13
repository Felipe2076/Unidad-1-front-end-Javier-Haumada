# Proyecto Club Deportivo - SportHub

Proyecto de front-end con HTML5 y CSS3 para un sistema web de club deportivo.

## Estructura del Proyecto

```
proyecto-club/
├── index.html          → Redirige automáticamente al login
├── login.html          → Página principal de acceso
├── register.html       → Formulario de registro
├── recover.html        → Recuperación de contraseña
├── css/
│   ├── styles.css      → Estilos globales (variables, fuentes, reset)
│   └── forms.css       → Estilos específicos de formularios
└── img/               → Carpeta para imágenes/logo (opcional)
```

## Páginas Desarrolladas

- **index.html**: Página de inicio que redirige automáticamente a login.html
- **login.html**: Página de inicio de sesión con email, contraseña, botones sociales y enlaces
- **register.html**: Formulario de registro con campos obligatorios y opcionales
- **recover.html**: Página de recuperación de contraseña con simulación de envío

## Tecnologías Utilizadas

- HTML5 semántico
- CSS3 con variables CSS y diseño responsive
- JavaScript básico para simulación en recuperación

## Cómo Ejecutar

1. Abre `index.html` en un navegador (redirige automáticamente al login)
2. O abre directamente `login.html` para acceder al sistema
3. Navega entre las páginas usando los enlaces

## Backend local (opcional)

El proyecto ahora incluye un backend simple para login y registro y se ejecuta en `http://localhost:3000`.

1. Abre una terminal en la carpeta `backend`
2. Ejecuta `npm install`
3. Ejecuta `npm start`
4. Luego usa `login.html` y `register.html` desde el frontend

También puedes abrir la app desde el mismo backend en:

- `http://localhost:3000/index.html`
- `http://localhost:3000/login.html`

## Usuarios demo

- Admin: `admin1@sportclub.cl` / `admin1234`
- Coach: `coach1@sportclub.cl` / `coach1234`
- Usuario: `user1@sportclub.cl` / `demo1234`

## Evidencias de prueba para entrega

Fecha de verificación: 13/05/2026.

- Login correcto con usuario demo y redirección según rol.
- CRUD de usuarios disponible desde el dashboard de administrador.
- Perfil de usuario editable y cambio de contraseña conectado a la API.
- Backend endurecido con contraseñas hasheadas, sesiones con expiración, validación de roles y protección básica contra intentos repetidos de login.

Evidencia documentada en el repositorio:

- `docs/evidencias/evidencia-entrega.md`
- `docs/evidencias/prueba-login-brave.png`

## Requerimientos Cumplidos

- Estructura semántica HTML5
- Estilos CSS3 coherentes y responsive
- Campos de formulario según especificaciones
- Navegación entre páginas
- Simulación de funcionalidades
