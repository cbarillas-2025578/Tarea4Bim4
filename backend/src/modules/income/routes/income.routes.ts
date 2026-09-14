import { Router } from "express";
import { incomeController } from "../controllers/income.controller";
import { AuthenticatedRequest } from "../../../middleware/auth.middleware";

const router = Router();

// GET /api/incomes?month=&year=&source=
router.get("/", (req, res) => incomeController.findAll(req as unknown as AuthenticatedRequest, res));

// GET /api/incomes/:id
router.get("/:id", (req, res) => incomeController.findOne(req as unknown as AuthenticatedRequest, res));

// POST /api/incomes
router.post("/", (req, res) => incomeController.create(req as unknown as AuthenticatedRequest, res));

// PUT /api/incomes/:id
router.put("/:id", (req, res) => incomeController.update(req as unknown as AuthenticatedRequest, res));

// DELETE /api/incomes/:id
router.delete("/:id", (req, res) => incomeController.delete(req as unknown as AuthenticatedRequest, res));

export default router;