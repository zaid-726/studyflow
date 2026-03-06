import "dotenv/config";
import express from "express";
import Database from "better-sqlite3";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import cors from "cors";
import path from "path";
import fs from "fs";

const db = new Database("studyflow.db");

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER NOT NULL,
    title TEXT NOT NULL,
    subject TEXT NOT NULL,
    duration INTEGER NOT NULL,
    status TEXT NOT NULL,
    date TEXT NOT NULL,
    completedAt TEXT,
    FOREIGN KEY(userId) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS goals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER NOT NULL,
    title TEXT NOT NULL,
    targetDate TEXT NOT NULL,
    progress INTEGER NOT NULL,
    FOREIGN KEY(userId) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER NOT NULL,
    date TEXT NOT NULL,
    duration INTEGER NOT NULL,
    subject TEXT NOT NULL,
    FOREIGN KEY(userId) REFERENCES users(id)
  );
`);

try {
  db.exec(`
    ALTER TABLE users ADD COLUMN resetToken TEXT;
    ALTER TABLE users ADD COLUMN resetTokenExpiry INTEGER;
  `);
} catch (e) {
  // Columns might already exist
}

const JWT_SECRET = process.env.JWT_SECRET || "super-secret-key";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // Auth Middleware
  const authenticateToken = (req: any, res: any, next: any) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) return res.sendStatus(401);

    jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
      if (err) return res.sendStatus(403);
      req.user = user;
      next();
    });
  };

  // --- API Routes ---

  // Auth
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { name, email, password } = req.body;
      const hashedPassword = await bcrypt.hash(password, 10);
      
      const stmt = db.prepare("INSERT INTO users (name, email, password) VALUES (?, ?, ?)");
      const info = stmt.run(name, email, hashedPassword);
      
      const token = jwt.sign({ id: info.lastInsertRowid, email }, JWT_SECRET);
      res.json({ token, user: { id: info.lastInsertRowid, name, email } });
    } catch (error: any) {
      if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        res.status(400).json({ error: "Email already exists" });
      } else {
        res.status(500).json({ error: "Server error" });
      }
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      const stmt = db.prepare("SELECT * FROM users WHERE email = ?");
      const user = stmt.get(email) as any;

      if (!user) return res.status(400).json({ error: "Invalid credentials" });

      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) return res.status(400).json({ error: "Invalid credentials" });

      const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET);
      res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
    } catch (error) {
      res.status(500).json({ error: "Server error" });
    }
  });

  app.get("/api/auth/me", authenticateToken, (req: any, res) => {
    const stmt = db.prepare("SELECT id, name, email FROM users WHERE id = ?");
    const user = stmt.get(req.user.id);
    res.json({ user });
  });

  app.post("/api/auth/forgot-password", async (req, res) => {
    try {
      const { email } = req.body;
      const stmt = db.prepare("SELECT * FROM users WHERE email = ?");
      const user = stmt.get(email) as any;

      if (!user) {
        return res.json({ success: true, message: "If an account exists, a reset link has been sent." });
      }

      const resetToken = crypto.randomBytes(32).toString("hex");
      const resetTokenExpiry = Date.now() + 3600000; // 1 hour

      const updateStmt = db.prepare("UPDATE users SET resetToken = ?, resetTokenExpiry = ? WHERE id = ?");
      updateStmt.run(resetToken, resetTokenExpiry, user.id);

      const resetLink = `${process.env.APP_URL || 'http://localhost:3000'}/reset-password/${resetToken}`;
      console.log(`Password reset link for ${email}: ${resetLink}`);

      res.json({ 
        success: true, 
        message: "If an account exists, a reset link has been sent.",
        _demoLink: resetLink 
      });
    } catch (error) {
      res.status(500).json({ error: "Server error" });
    }
  });

  app.post("/api/auth/reset-password", async (req, res) => {
    try {
      const { token, password } = req.body;
      
      const stmt = db.prepare("SELECT * FROM users WHERE resetToken = ? AND resetTokenExpiry > ?");
      const user = stmt.get(token, Date.now()) as any;

      if (!user) {
        return res.status(400).json({ error: "Invalid or expired reset token" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      
      const updateStmt = db.prepare("UPDATE users SET password = ?, resetToken = NULL, resetTokenExpiry = NULL WHERE id = ?");
      updateStmt.run(hashedPassword, user.id);

      res.json({ success: true, message: "Password has been reset successfully" });
    } catch (error) {
      res.status(500).json({ error: "Server error" });
    }
  });

  // Tasks
  app.get("/api/tasks", authenticateToken, (req: any, res) => {
    const stmt = db.prepare("SELECT * FROM tasks WHERE userId = ?");
    const tasks = stmt.all(req.user.id);
    res.json(tasks);
  });

  app.post("/api/tasks", authenticateToken, (req: any, res) => {
    const { title, subject, duration, status, date } = req.body;
    const stmt = db.prepare("INSERT INTO tasks (userId, title, subject, duration, status, date) VALUES (?, ?, ?, ?, ?, ?)");
    const info = stmt.run(req.user.id, title, subject, duration, status, date);
    res.json({ id: info.lastInsertRowid, title, subject, duration, status, date });
  });

  app.put("/api/tasks/:id", authenticateToken, (req: any, res) => {
    const { status, completedAt } = req.body;
    const stmt = db.prepare("UPDATE tasks SET status = ?, completedAt = ? WHERE id = ? AND userId = ?");
    stmt.run(status, completedAt, req.params.id, req.user.id);
    res.json({ success: true });
  });

  app.delete("/api/tasks/:id", authenticateToken, (req: any, res) => {
    const stmt = db.prepare("DELETE FROM tasks WHERE id = ? AND userId = ?");
    stmt.run(req.params.id, req.user.id);
    res.json({ success: true });
  });

  // Goals
  app.get("/api/goals", authenticateToken, (req: any, res) => {
    const stmt = db.prepare("SELECT * FROM goals WHERE userId = ?");
    const goals = stmt.all(req.user.id);
    res.json(goals);
  });

  app.post("/api/goals", authenticateToken, (req: any, res) => {
    const { title, targetDate, progress } = req.body;
    const stmt = db.prepare("INSERT INTO goals (userId, title, targetDate, progress) VALUES (?, ?, ?, ?)");
    const info = stmt.run(req.user.id, title, targetDate, progress);
    res.json({ id: info.lastInsertRowid, title, targetDate, progress });
  });

  // Sessions
  app.get("/api/sessions", authenticateToken, (req: any, res) => {
    const stmt = db.prepare("SELECT * FROM sessions WHERE userId = ?");
    const sessions = stmt.all(req.user.id);
    res.json(sessions);
  });

  app.post("/api/sessions", authenticateToken, (req: any, res) => {
    const { date, duration, subject } = req.body;
    const stmt = db.prepare("INSERT INTO sessions (userId, date, duration, subject) VALUES (?, ?, ?, ?)");
    const info = stmt.run(req.user.id, date, duration, subject);
    res.json({ id: info.lastInsertRowid, date, duration, subject });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
      root: path.resolve(process.cwd(), "frontend"),
    });
    app.use(vite.middlewares);
  } else {
    const frontendDistPath = path.resolve(process.cwd(), "frontend/dist");
    if (fs.existsSync(frontendDistPath)) {
      app.use(express.static(frontendDistPath));
      app.get("*", (req, res) => {
        res.sendFile(path.join(frontendDistPath, "index.html"));
      });
    } else {
      app.get("/", (req, res) => {
        res.send("Backend API is running. Frontend is deployed separately.");
      });
    }
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
