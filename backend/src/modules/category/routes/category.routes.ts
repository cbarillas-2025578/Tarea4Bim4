import { Router } from "express";
import { categoryController } from "../controllers/category.controller";

const router = Router();

// GET /api/categories?type=expense|income
router.get("/", (req, res) => categoryController.findAll(req, res));

// GET /api/categories/:id
router.get("/:id", (req, res) => categoryController.findOne(req, res));

// POST /api/categories
router.post("/", (req, res) => categoryController.create(req, res));

// PUT /api/categories/:id
router.put("/:id", (req, res) => categoryController.update(req, res));

// DELETE /api/categories/:id
router.delete("/:id", (req, res) => categoryController.delete(req, res));

export default router;
