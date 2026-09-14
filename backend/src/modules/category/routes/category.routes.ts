import { Router } from "express";
import { categoryController } from "../controllers/category.controller";
import { AuthenticatedRequest } from "../../../middleware/auth.middleware";

const router = Router();

// GET /api/categories
router.get("/", (req, res) => categoryController.findAll(req as unknown as AuthenticatedRequest, res));

// GET /api/categories/:id
router.get("/:id", (req, res) => categoryController.findOne(req as unknown as AuthenticatedRequest, res));

// POST /api/categories
router.post("/", (req, res) => categoryController.create(req as unknown as AuthenticatedRequest, res));

// PUT /api/categories/:id
router.put("/:id", (req, res) => categoryController.update(req as unknown as AuthenticatedRequest, res));

// DELETE /api/categories/:id
router.delete("/:id", (req, res) => categoryController.delete(req as unknown as AuthenticatedRequest, res));

export default router;