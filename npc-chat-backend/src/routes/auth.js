import express from "express";
import { register, login, verifyToken } from "../controllers/auth.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);

// ✅ Verificación directa del token
router.get("/verify", verifyToken);

// ✅ Ejemplo de endpoint protegido
router.get("/profile", requireAuth, (req, res) => {
  res.json({ user: req.user });
});

export default router;
