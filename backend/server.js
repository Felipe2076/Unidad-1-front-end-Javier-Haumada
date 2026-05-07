const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;
const DB_PATH = path.join(__dirname, "users.json");

app.use(cors());
app.use(express.json());

function normalizeEmail(value) {
  return String(value || "").trim().toLowerCase();
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

function getPublicUser(user) {
  return {
    name: user.name,
    user: user.user,
    role: user.role,
    age: user.age || null,
    practiceDeporte: user.practiceDeporte || false,
    typeDeporte: user.typeDeporte || "",
    objectivePersonal: user.objectivePersonal || "",
    level: user.level || "",
    infoAdicional: user.infoAdicional || ""
  };
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
  const user = users.find((currentUser) => normalizeEmail(currentUser.user) === email);

  if (!user || user.password !== password) {
    return res.status(401).json({ error: "Credenciales incorrectas." });
  }

  return res.json({ user: getPublicUser(user) });
});

app.post("/api/auth/register", (req, res) => {
  const email = normalizeEmail(req.body.email);
  const password = String(req.body.password || "").trim();
  const name = String(req.body.name || "").trim();
  const age = req.body.age ? Number(req.body.age) : null;
  const practiceDeporte = req.body.practiceDeporte === true || req.body.practiceDeporte === "si";
  const typeDeporte = String(req.body.typeDeporte || "").trim();
  const objectivePersonal = String(req.body.objectivePersonal || "").trim();
  const level = String(req.body.level || "").trim();
  const infoAdicional = String(req.body.infoAdicional || "").trim();

  if (!email || !password) {
    return res.status(400).json({ error: "Debes completar correo y contraseña." });
  }

  if (password.length < 8) {
    return res.status(400).json({ error: "La contraseña debe tener al menos 8 caracteres." });
  }

  const users = loadUsers();
  const alreadyExists = users.some((currentUser) => normalizeEmail(currentUser.user) === email);

  if (alreadyExists) {
    return res.status(409).json({ error: "Ese correo ya está registrado." });
  }

  const newUser = {
    name: name || "Nuevo Usuario",
    user: email,
    password,
    role: "user",
    age,
    practiceDeporte,
    typeDeporte,
    objectivePersonal,
    level,
    infoAdicional
  };

  users.push(newUser);
  saveUsers(users);

  return res.status(201).json({ user: getPublicUser(newUser) });
});

app.listen(PORT, () => {
  console.log(`SportClub backend API running on http://localhost:${PORT}`);
});
