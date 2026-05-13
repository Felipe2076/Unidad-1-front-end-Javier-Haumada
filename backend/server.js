const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");
const crypto = require("crypto");

const app = express();
const PORT = process.env.PORT || 3000;
const DB_PATH = path.join(__dirname, "users.json");
const FRONTEND_PATH = path.join(__dirname, "..");
const PASSWORD_ALGORITHM = "pbkdf2_sha256";
const PASSWORD_ITERATIONS = 120000;
const PASSWORD_KEY_LENGTH = 64;
const SESSION_TTL_MS = Number(process.env.SESSION_TTL_MS || 60 * 60 * 1000);
const LOGIN_WINDOW_MS = 15 * 60 * 1000;
const LOGIN_MAX_ATTEMPTS = 5;
const ALLOWED_ROLES = new Set(["user", "coach", "admin"]);
const sessions = new Map();
const loginAttempts = new Map();

const allowedOrigins = (process.env.CORS_ORIGINS || "http://localhost:3000,http://127.0.0.1:3000,http://localhost:5500,http://127.0.0.1:5500,null")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }
    callback(new Error("Origen no permitido por CORS."));
  }
}));
app.use(express.json({ limit: "10kb" }));
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "no-referrer");
  next();
});
app.use("/css", express.static(path.join(FRONTEND_PATH, "css")));
app.use("/js", express.static(path.join(FRONTEND_PATH, "js")));
app.use("/img", express.static(path.join(FRONTEND_PATH, "img")));

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

function normalizeRole(value, fallback = "user") {
  return String(value || fallback).trim().toLowerCase();
}

function isAllowedRole(role) {
  return ALLOWED_ROLES.has(role);
}

function hashPassword(password, salt = crypto.randomBytes(16).toString("hex")) {
  const hash = crypto
    .pbkdf2Sync(String(password || ""), salt, PASSWORD_ITERATIONS, PASSWORD_KEY_LENGTH, "sha256")
    .toString("hex");
  return `${PASSWORD_ALGORITHM}$${PASSWORD_ITERATIONS}$${salt}$${hash}`;
}

function timingSafeHexCompare(left, right) {
  const leftBuffer = Buffer.from(left, "hex");
  const rightBuffer = Buffer.from(right, "hex");

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(leftBuffer, rightBuffer);
}

function verifyPasswordHash(password, passwordHash) {
  const [algorithm, iterationsValue, salt, storedHash] = String(passwordHash || "").split("$");
  const iterations = Number(iterationsValue);

  if (algorithm !== PASSWORD_ALGORITHM || !Number.isInteger(iterations) || !salt || !storedHash) {
    return false;
  }

  const candidateHash = crypto
    .pbkdf2Sync(String(password || ""), salt, iterations, PASSWORD_KEY_LENGTH, "sha256")
    .toString("hex");

  return timingSafeHexCompare(candidateHash, storedHash);
}

function setUserPassword(user, password) {
  user.passwordHash = hashPassword(password);
  delete user.password;
}

function verifyUserPassword(user, password) {
  if (user.passwordHash) {
    return verifyPasswordHash(password, user.passwordHash);
  }

  return typeof user.password === "string" && user.password === password;
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

function migrateLegacyPasswords() {
  const users = loadUsers();
  let changed = false;

  users.forEach((user) => {
    if (user.password && !user.passwordHash) {
      setUserPassword(user, user.password);
      changed = true;
    }
  });

  if (changed) {
    saveUsers(users);
  }
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
    firstName: user.firstName || "",
    lastNamePaternal: user.lastNamePaternal || "",
    lastNameMaternal: user.lastNameMaternal || "",
    user: user.user,
    role: user.role,
    age: user.age || null,
    birthDate: user.birthDate || "",
    practiceDeporte: user.practiceDeporte || false,
    typeDeporte: user.typeDeporte || "",
    objectivePersonal: user.objectivePersonal || "",
    level: user.level || "",
    healthCondition: user.healthCondition || user.infoAdicional || "",
    infoAdicional: user.infoAdicional || "",
    createdAt: user.createdAt || ""
  };
}

function createToken(user) {
  const token = crypto.randomUUID();
  const now = Date.now();
  sessions.set(token, {
    userId: user.id,
    role: user.role,
    issuedAt: now,
    expiresAt: now + SESSION_TTL_MS
  });
  return token;
}

function getSessionFromToken(token) {
  if (!token) {
    return null;
  }
  const session = sessions.get(token);

  if (!session) {
    return null;
  }

  if (session.expiresAt <= Date.now()) {
    sessions.delete(token);
    return null;
  }

  return session;
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

function getLoginAttemptKey(req, email) {
  return `${req.ip}:${email}`;
}

function getLoginAttempt(key) {
  const attempt = loginAttempts.get(key);

  if (!attempt || attempt.resetAt <= Date.now()) {
    loginAttempts.delete(key);
    return null;
  }

  return attempt;
}

function isLoginBlocked(key) {
  const attempt = getLoginAttempt(key);
  return Boolean(attempt && attempt.count >= LOGIN_MAX_ATTEMPTS);
}

function recordFailedLogin(key) {
  const attempt = getLoginAttempt(key) || { count: 0, resetAt: Date.now() + LOGIN_WINDOW_MS };
  attempt.count += 1;
  loginAttempts.set(key, attempt);
}

function clearLoginAttempts(key) {
  loginAttempts.delete(key);
}

function sendFrontendPage(res, fileName) {
  res.sendFile(path.join(FRONTEND_PATH, fileName));
}

app.get(["/", "/index.html"], (req, res) => {
  sendFrontendPage(res, "index.html");
});

app.get(["/login.html", "/register.html", "/recover.html", "/dashboard_usuario.html", "/dashboard_coach.html", "/dashboard_admin.html"], (req, res) => {
  sendFrontendPage(res, path.basename(req.path));
});

app.get(["/clases", "/reservas", "/progreso", "/perfil/editar"], (req, res) => {
  sendFrontendPage(res, "dashboard_usuario.html");
});

app.get(["/admin/usuarios"], (req, res) => {
  sendFrontendPage(res, "dashboard_admin.html");
});

app.get(["/coach/reservas"], (req, res) => {
  sendFrontendPage(res, "dashboard_coach.html");
});

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.post("/api/auth/login", (req, res) => {
  const email = normalizeEmail(req.body.email);
  const password = String(req.body.password || "").trim();

  if (!email || !password) {
    return res.status(400).json({ error: "Debes enviar correo y contraseña." });
  }

  const attemptKey = getLoginAttemptKey(req, email);

  if (isLoginBlocked(attemptKey)) {
    return res.status(429).json({ error: "Demasiados intentos fallidos. Intenta nuevamente en unos minutos." });
  }

  const users = loadUsers();
  const foundUser = users.find((user) => normalizeEmail(user.user) === email);

  if (!foundUser || !verifyUserPassword(foundUser, password)) {
    recordFailedLogin(attemptKey);
    return res.status(401).json({ error: "Credenciales incorrectas." });
  }

  if (foundUser.password && !foundUser.passwordHash) {
    setUserPassword(foundUser, password);
    saveUsers(users);
  }

  clearLoginAttempts(attemptKey);
  const token = createToken(foundUser);
  res.json({ user: sanitizeUser(foundUser), token });
});

app.post("/api/auth/register", (req, res) => {
  const email = normalizeEmail(req.body.email);
  const password = String(req.body.password || "").trim();
  const confirmPassword = String(req.body.confirmPassword || "").trim();
  const firstName = String(req.body.firstName || "").trim();
  const lastNamePaternal = String(req.body.lastNamePaternal || "").trim();
  const lastNameMaternal = String(req.body.lastNameMaternal || "").trim();
  const name = String(req.body.name || [firstName, lastNamePaternal, lastNameMaternal].filter(Boolean).join(" ")).trim();
  const age = req.body.age ? Number(req.body.age) : null;
  const birthDate = String(req.body.birthDate || "").trim();
  const practiceDeporte = parseBoolean(req.body.practiceDeporte);
  const typeDeporte = String(req.body.typeDeporte || "").trim();
  const objectivePersonal = String(req.body.objectivePersonal || "").trim();
  const level = String(req.body.level || "").trim();
  const healthCondition = String(req.body.healthCondition || req.body.infoAdicional || "").trim();
  const infoAdicional = String(req.body.infoAdicional || healthCondition).trim();

  if (!firstName || !lastNamePaternal || !lastNameMaternal || !age || !email || !password || !confirmPassword || !req.body.practiceDeporte || !level || !healthCondition) {
    return res.status(400).json({ error: "Debes completar identidad, acceso, perfil deportivo y salud." });
  }

  if (!Number.isFinite(age) || age < 12 || age > 120) {
    return res.status(400).json({ error: "La edad debe estar entre 12 y 120." });
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
    firstName,
    lastNamePaternal,
    lastNameMaternal,
    user: email,
    role: "user",
    age,
    birthDate,
    practiceDeporte,
    typeDeporte,
    objectivePersonal,
    level,
    healthCondition,
    infoAdicional,
    createdAt: new Date().toISOString()
  };

  setUserPassword(newUser, password);
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
  const firstName = String(req.body.firstName || currentUser.firstName || "").trim();
  const lastNamePaternal = String(req.body.lastNamePaternal || currentUser.lastNamePaternal || "").trim();
  const lastNameMaternal = String(req.body.lastNameMaternal || currentUser.lastNameMaternal || "").trim();
  const age = req.body.age ? Number(req.body.age) : currentUser.age || null;
  const birthDate = String(req.body.birthDate || currentUser.birthDate).trim();
  const practiceDeporte = typeof req.body.practiceDeporte !== "undefined" ? parseBoolean(req.body.practiceDeporte) : currentUser.practiceDeporte;
  const typeDeporte = String(req.body.typeDeporte || currentUser.typeDeporte).trim();
  const objectivePersonal = String(req.body.objectivePersonal || currentUser.objectivePersonal).trim();
  const level = String(req.body.level || currentUser.level).trim();
  const healthCondition = String(req.body.healthCondition || currentUser.healthCondition || currentUser.infoAdicional || "").trim();
  const infoAdicional = String(req.body.infoAdicional || currentUser.infoAdicional || healthCondition).trim();

  if (!name) {
    return res.status(400).json({ error: "El nombre es obligatorio." });
  }

  currentUser.name = name;
  currentUser.firstName = firstName;
  currentUser.lastNamePaternal = lastNamePaternal;
  currentUser.lastNameMaternal = lastNameMaternal;
  currentUser.age = age;
  currentUser.birthDate = birthDate;
  currentUser.practiceDeporte = practiceDeporte;
  currentUser.typeDeporte = typeDeporte;
  currentUser.objectivePersonal = objectivePersonal;
  currentUser.level = level;
  currentUser.healthCondition = healthCondition;
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

  if (!verifyUserPassword(req.user, currentPassword)) {
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

  setUserPassword(currentUser, newPassword);
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
  const firstName = String(req.body.firstName || "").trim();
  const lastNamePaternal = String(req.body.lastNamePaternal || "").trim();
  const lastNameMaternal = String(req.body.lastNameMaternal || "").trim();
  const name = String(req.body.name || [firstName, lastNamePaternal, lastNameMaternal].filter(Boolean).join(" ")).trim();
  const role = normalizeRole(req.body.role);
  const age = req.body.age ? Number(req.body.age) : null;
  const birthDate = String(req.body.birthDate || "").trim();
  const practiceDeporte = parseBoolean(req.body.practiceDeporte);
  const typeDeporte = String(req.body.typeDeporte || "").trim();
  const objectivePersonal = String(req.body.objectivePersonal || "").trim();
  const level = String(req.body.level || "").trim();
  const healthCondition = String(req.body.healthCondition || req.body.infoAdicional || "").trim();
  const infoAdicional = String(req.body.infoAdicional || healthCondition).trim();

  if (!name || !email || !password || !confirmPassword || !role) {
    return res.status(400).json({ error: "Todos los campos obligatorios deben completarse." });
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({ error: "El correo electrónico no es válido." });
  }

  if (!isAllowedRole(role)) {
    return res.status(400).json({ error: "El rol enviado no es válido." });
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
    firstName,
    lastNamePaternal,
    lastNameMaternal,
    user: email,
    role,
    age,
    birthDate,
    practiceDeporte,
    typeDeporte,
    objectivePersonal,
    level,
    healthCondition,
    infoAdicional,
    createdAt: new Date().toISOString()
  };

  setUserPassword(newUser, password);
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
  const firstName = String(req.body.firstName || user.firstName || "").trim();
  const lastNamePaternal = String(req.body.lastNamePaternal || user.lastNamePaternal || "").trim();
  const lastNameMaternal = String(req.body.lastNameMaternal || user.lastNameMaternal || "").trim();
  const name = String(req.body.name || [firstName, lastNamePaternal, lastNameMaternal].filter(Boolean).join(" ") || user.name).trim();
  const role = normalizeRole(req.body.role || user.role);
  const age = req.body.age ? Number(req.body.age) : user.age || null;
  const birthDate = String(req.body.birthDate || user.birthDate).trim();
  const practiceDeporte = typeof req.body.practiceDeporte !== "undefined" ? parseBoolean(req.body.practiceDeporte) : user.practiceDeporte;
  const typeDeporte = String(req.body.typeDeporte || user.typeDeporte).trim();
  const objectivePersonal = String(req.body.objectivePersonal || user.objectivePersonal).trim();
  const level = String(req.body.level || user.level).trim();
  const healthCondition = String(req.body.healthCondition || user.healthCondition || user.infoAdicional || "").trim();
  const infoAdicional = String(req.body.infoAdicional || user.infoAdicional || healthCondition).trim();

  if (!name || !email) {
    return res.status(400).json({ error: "El nombre y el correo son obligatorios." });
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({ error: "El correo electrónico no es válido." });
  }

  if (!isAllowedRole(role)) {
    return res.status(400).json({ error: "El rol enviado no es válido." });
  }

  const emailTaken = users.some(
    (entry) => normalizeEmail(entry.user) === email && String(entry.id) !== String(user.id)
  );

  if (emailTaken) {
    return res.status(409).json({ error: "Otro usuario ya utiliza ese correo." });
  }

  user.name = name;
  user.firstName = firstName;
  user.lastNamePaternal = lastNamePaternal;
  user.lastNameMaternal = lastNameMaternal;
  user.user = email;
  user.role = role;
  user.age = age;
  user.birthDate = birthDate;
  user.practiceDeporte = practiceDeporte;
  user.typeDeporte = typeDeporte;
  user.objectivePersonal = objectivePersonal;
  user.level = level;
  user.healthCondition = healthCondition;
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

    setUserPassword(user, password);
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

migrateLegacyPasswords();

app.listen(PORT, () => {
  console.log(`SportClub backend API running on http://localhost:${PORT}`);
});
