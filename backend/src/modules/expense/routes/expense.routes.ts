import { Router } from "express";
import { expenseController } from "../controllers/expense.controller";
import { AuthenticatedRequest } from "../../../middleware/auth.middleware";

const router = Router();

// GET /api/expenses?month=&year=&category=
router.get("/", (req, res) => expenseController.findAll(req as unknown as AuthenticatedRequest, res));

// GET /api/expenses/:id
router.get("/:id", (req, res) => expenseController.findOne(req as unknown as AuthenticatedRequest, res));

// POST /api/expenses
router.post("/", (req, res) => expenseController.create(req as unknown as AuthenticatedRequest, res));

// PUT /api/expenses/:id
router.put("/:id", (req, res) => expenseController.update(req as unknown as AuthenticatedRequest, res));

// DELETE /api/expenses/:id
router.delete("/:id", (req, res) => expenseController.delete(req as unknown as AuthenticatedRequest, res));

export default router;