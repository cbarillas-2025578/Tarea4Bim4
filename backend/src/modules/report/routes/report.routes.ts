import { Router } from "express";
import { reportController } from "../controllers/report.controller";
import { AuthenticatedRequest } from "../../../middleware/auth.middleware";

const router = Router();

// GET /api/reports/:year  -> reporte anual
// GET /api/reports/:year/:month -> reporte mensual
router.get("/:year/:month?", (req, res) => reportController.getReport(req as unknown as AuthenticatedRequest, res));

export default router;