const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");
const crypto = require("crypto");

const app = express();
const PORT = process.env.PORT || 3000;
const DB_PATH = path.join(__dirname, "users.json");
const sessions = new Map();

app.use(cors());
app.use(express.json());

function normalizeEmail(value) {
  return String(value || "").trim().toLowerCase();
}

function isValidEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

function parseBoolean(value) {
  return value === true || value === "si" || value === "true";
}

function loadUsers() {
  try {
    const raw = fs.readFileSync(DB_PATH, "utf8");
    const users = JSON.parse(raw);
    return Array.isArray(users) ? users : [];
  } catch (error) {
    return [];
  }
}

function saveUsers(users) {
  fs.writeFileSync(DB_PATH, JSON.stringify(users, null, 2), "utf8");
}

function getNextUserId(users) {
  return users.reduce((maxId, user) => {
    const id = Number(user.id || 0);
    return Number.isFinite(id) ? Math.max(maxId, id) : maxId;
  }, 0) + 1;
}

function sanitizeUser(user) {
  return {
    id: user.id,
    name: user.name,
    user: user.user,
    role: user.role,
    age: user.age || null,
    birthDate: user.birthDate || "",
    practiceDeporte: user.practiceDeporte || false,
    typeDeporte: user.typeDeporte || "",
    objectivePersonal: user.objectivePersonal || "",
    level: user.level || "",
    infoAdicional: user.infoAdicional || "",
    createdAt: user.createdAt || ""
  };
}

function createToken(user) {
  const token = crypto.randomUUID();
  sessions.set(token, {
    userId: user.id,
    role: user.role,
    issuedAt: Date.now()
  });
  return token;
}

function getSessionFromToken(token) {
  if (!token) {
    return null;
  }
  return sessions.get(token);
}

function authMiddleware(req, res, next) {
  const authHeader = String(req.headers.authorization || "");
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7).trim() : null;
  const session = getSessionFromToken(token);

  if (!session) {
    return res.status(401).json({ error: "Token inválido o expirado." });
  }

  const users = loadUsers();
  const currentUser = users.find((user) => String(user.id) === String(session.userId));

  if (!currentUser) {
    return res.status(401).json({ error: "Usuario no encontrado." });
  }

  req.user = currentUser;
  req.token = token;
  next();
}

function adminMiddleware(req, res, next) {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ error: "Permisos insuficientes." });
  }
  next();
}

function validatePassword(password) {
  return String(password || "").trim().length >= 8;
}

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.post("/api/auth/login", (req, res) => {
  const email = normalizeEmail(req.body.email);
  const password = String(req.body.password || "").trim();

  if (!email || !password) {
    return res.status(400).json({ error: "Debes enviar correo y contraseña." });
  }

  const users = loadUsers();
  const foundUser = users.find((user) => normalizeEmail(user.user) === email);

  if (!foundUser || foundUser.password !== password) {
    return res.status(401).json({ error: "Credenciales incorrectas." });
  }

  const token = createToken(foundUser);
  res.json({ user: sanitizeUser(foundUser), token });
});

app.post("/api/auth/register", (req, res) => {
  const email = normalizeEmail(req.body.email);
  const password = String(req.body.password || "").trim();
  const confirmPassword = String(req.body.confirmPassword || "").trim();
  const name = String(req.body.name || "").trim();
  const age = req.body.age ? Number(req.body.age) : null;
  const birthDate = String(req.body.birthDate || "").trim();
  const practiceDeporte = parseBoolean(req.body.practiceDeporte);
  const typeDeporte = String(req.body.typeDeporte || "").trim();
  const objectivePersonal = String(req.body.objectivePersonal || "").trim();
  const level = String(req.body.level || "").trim();
  const infoAdicional = String(req.body.infoAdicional || "").trim();

  if (!email || !password || !confirmPassword) {
    return res.status(400).json({ error: "Debes enviar correo, contraseña y confirmación." });
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({ error: "El correo electrónico no es válido." });
  }

  if (!validatePassword(password)) {
    return res.status(400).json({ error: "La contraseña debe tener al menos 8 caracteres." });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ error: "Las contraseñas no coinciden." });
  }

  const users = loadUsers();
  const alreadyExists = users.some((user) => normalizeEmail(user.user) === email);

  if (alreadyExists) {
    return res.status(409).json({ error: "Ese correo ya está registrado." });
  }

  const newUser = {
    id: getNextUserId(users),
    name: name || "Nuevo Usuario",
    user: email,
    password,
    role: "user",
    age,
    birthDate,
    practiceDeporte,
    typeDeporte,
    objectivePersonal,
    level,
    infoAdicional,
    createdAt: new Date().toISOString()
  };

  users.push(newUser);
  saveUsers(users);

  const token = createToken(newUser);
  res.status(201).json({ user: sanitizeUser(newUser), token });
});

app.get("/api/auth/me", authMiddleware, (req, res) => {
  res.json({ user: sanitizeUser(req.user) });
});

app.put("/api/auth/me", authMiddleware, (req, res) => {
  const users = loadUsers();
  const currentUser = users.find((user) => String(user.id) === String(req.user.id));

  if (!currentUser) {
    return res.status(404).json({ error: "Usuario no encontrado." });
  }

  const name = String(req.body.name || currentUser.name).trim();
  const age = req.body.age ? Number(req.body.age) : currentUser.age || null;
  const birthDate = String(req.body.birthDate || currentUser.birthDate).trim();
  const practiceDeporte = typeof req.body.practiceDeporte !== "undefined" ? parseBoolean(req.body.practiceDeporte) : currentUser.practiceDeporte;
  const typeDeporte = String(req.body.typeDeporte || currentUser.typeDeporte).trim();
  const objectivePersonal = String(req.body.objectivePersonal || currentUser.objectivePersonal).trim();
  const level = String(req.body.level || currentUser.level).trim();
  const infoAdicional = String(req.body.infoAdicional || currentUser.infoAdicional).trim();

  if (!name) {
    return res.status(400).json({ error: "El nombre es obligatorio." });
  }

  currentUser.name = name;
  currentUser.age = age;
  currentUser.birthDate = birthDate;
  currentUser.practiceDeporte = practiceDeporte;
  currentUser.typeDeporte = typeDeporte;
  currentUser.objectivePersonal = objectivePersonal;
  currentUser.level = level;
  currentUser.infoAdicional = infoAdicional;

  saveUsers(users);
  res.json({ user: sanitizeUser(currentUser) });
});

app.put("/api/auth/me/password", authMiddleware, (req, res) => {
  const currentPassword = String(req.body.currentPassword || "").trim();
  const newPassword = String(req.body.newPassword || "").trim();
  const confirmPassword = String(req.body.confirmPassword || "").trim();

  if (!currentPassword || !newPassword || !confirmPassword) {
    return res.status(400).json({ error: "Debes completar los tres campos de contraseña." });
  }

  if (req.user.password !== currentPassword) {
    return res.status(401).json({ error: "La contraseña actual es incorrecta." });
  }

  if (!validatePassword(newPassword)) {
    return res.status(400).json({ error: "La nueva contraseña debe tener al menos 8 caracteres." });
  }

  if (newPassword !== confirmPassword) {
    return res.status(400).json({ error: "Las nuevas contraseñas no coinciden." });
  }

  const users = loadUsers();
  const currentUser = users.find((user) => String(user.id) === String(req.user.id));

  if (!currentUser) {
    return res.status(404).json({ error: "Usuario no encontrado." });
  }

  currentUser.password = newPassword;
  saveUsers(users);

  res.json({ message: "Contraseña actualizada correctamente." });
});

app.get("/api/users", authMiddleware, adminMiddleware, (req, res) => {
  const users = loadUsers();
  res.json({ users: users.map(sanitizeUser) });
});

app.get("/api/users/:id", authMiddleware, adminMiddleware, (req, res) => {
  const users = loadUsers();
  const user = users.find((entry) => String(entry.id) === String(req.params.id));

  if (!user) {
    return res.status(404).json({ error: "Usuario no encontrado." });
  }

  res.json({ user: sanitizeUser(user) });
});

app.post("/api/users", authMiddleware, adminMiddleware, (req, res) => {
  const email = normalizeEmail(req.body.email);
  const password = String(req.body.password || "").trim();
  const confirmPassword = String(req.body.confirmPassword || "").trim();
  const name = String(req.body.name || "").trim();
  const role = String(req.body.role || "user").trim();
  const age = req.body.age ? Number(req.body.age) : null;
  const birthDate = String(req.body.birthDate || "").trim();
  const practiceDeporte = parseBoolean(req.body.practiceDeporte);
  const typeDeporte = String(req.body.typeDeporte || "").trim();
  const objectivePersonal = String(req.body.objectivePersonal || "").trim();
  const level = String(req.body.level || "").trim();
  const infoAdicional = String(req.body.infoAdicional || "").trim();

  if (!name || !email || !password || !confirmPassword || !role) {
    return res.status(400).json({ error: "Todos los campos obligatorios deben completarse." });
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({ error: "El correo electrónico no es válido." });
  }

  if (!validatePassword(password)) {
    return res.status(400).json({ error: "La contraseña debe tener al menos 8 caracteres." });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ error: "Las contraseñas no coinciden." });
  }

  const users = loadUsers();
  const alreadyExists = users.some((user) => normalizeEmail(user.user) === email);

  if (alreadyExists) {
    return res.status(409).json({ error: "Ese correo ya está registrado." });
  }

  const newUser = {
    id: getNextUserId(users),
    name,
    user: email,
    password,
    role,
    age,
    birthDate,
    practiceDeporte,
    typeDeporte,
    objectivePersonal,
    level,
    infoAdicional,
    createdAt: new Date().toISOString()
  };

  users.push(newUser);
  saveUsers(users);

  res.status(201).json({ user: sanitizeUser(newUser) });
});

app.put("/api/users/:id", authMiddleware, adminMiddleware, (req, res) => {
  const users = loadUsers();
  const user = users.find((entry) => String(entry.id) === String(req.params.id));

  if (!user) {
    return res.status(404).json({ error: "Usuario no encontrado." });
  }

  const email = normalizeEmail(req.body.email || user.user);
  const name = String(req.body.name || user.name).trim();
  const role = String(req.body.role || user.role).trim();
  const age = req.body.age ? Number(req.body.age) : user.age || null;
  const birthDate = String(req.body.birthDate || user.birthDate).trim();
  const practiceDeporte = typeof req.body.practiceDeporte !== "undefined" ? parseBoolean(req.body.practiceDeporte) : user.practiceDeporte;
  const typeDeporte = String(req.body.typeDeporte || user.typeDeporte).trim();
  const objectivePersonal = String(req.body.objectivePersonal || user.objectivePersonal).trim();
  const level = String(req.body.level || user.level).trim();
  const infoAdicional = String(req.body.infoAdicional || user.infoAdicional).trim();

  if (!name || !email) {
    return res.status(400).json({ error: "El nombre y el correo son obligatorios." });
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({ error: "El correo electrónico no es válido." });
  }

  const emailTaken = users.some(
    (entry) => normalizeEmail(entry.user) === email && String(entry.id) !== String(user.id)
  );

  if (emailTaken) {
    return res.status(409).json({ error: "Otro usuario ya utiliza ese correo." });
  }

  user.name = name;
  user.user = email;
  user.role = role;
  user.age = age;
  user.birthDate = birthDate;
  user.practiceDeporte = practiceDeporte;
  user.typeDeporte = typeDeporte;
  user.objectivePersonal = objectivePersonal;
  user.level = level;
  user.infoAdicional = infoAdicional;

  if (req.body.password) {
    const password = String(req.body.password || "").trim();
    const confirmPassword = String(req.body.confirmPassword || "").trim();

    if (!validatePassword(password)) {
      return res.status(400).json({ error: "La contraseña debe tener al menos 8 caracteres." });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ error: "Las contraseñas no coinciden." });
    }

    user.password = password;
  }

  saveUsers(users);
  res.json({ user: sanitizeUser(user) });
});

app.delete("/api/users/:id", authMiddleware, adminMiddleware, (req, res) => {
  const users = loadUsers();
  const targetId = String(req.params.id);
  const userIndex = users.findIndex((entry) => String(entry.id) === targetId);

  if (userIndex === -1) {
    return res.status(404).json({ error: "Usuario no encontrado." });
  }

  if (String(users[userIndex].id) === String(req.user.id)) {
    return res.status(400).json({ error: "No puedes eliminar tu propia cuenta." });
  }

  users.splice(userIndex, 1);
  saveUsers(users);

  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`SportClub backend API running on http://localhost:${PORT}`);
});
