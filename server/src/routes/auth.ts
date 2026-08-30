import express from "express";

import {
  register,
  login,
  me,
  logout,
} from "../controllers/authController";

import {
  githubRedirect,
  githubCallback,
} from "../controllers/oauthController";

import { requireAuth } from "../middleware/auth";

const router = express.Router();

// Normal authentication
router.post("/register", register);

router.post("/login", login);

router.post("/logout", logout);

router.get("/me", requireAuth, me);

// GitHub OAuth
router.get("/github", githubRedirect);

router.get("/github/callback", githubCallback);

export default router;