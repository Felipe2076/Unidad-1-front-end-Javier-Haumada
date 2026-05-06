# Backend SportClub

Este backend es un servidor simple de ejemplo para manejar login y registro con `fetch()`.

## Ejecutar localmente

1. Abrir una terminal en `backend`
2. Ejecutar:

```bash
npm install
npm start
```

3. El servidor quedará disponible en `http://localhost:3000`

## Endpoints

- `POST /api/auth/login`
  - Body: `{ "email": "tu@correo.com", "password": "tuClave" }`
  - Respuesta: `{ "user": { ... } }`

- `POST /api/auth/register`
  - Body: `{ "email": "tu@correo.com", "password": "tuClave", "name": "Tu Nombre", ... }`
  - Respuesta: `{ "user": { ... } }`
