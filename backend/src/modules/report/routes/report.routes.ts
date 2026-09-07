import { Router } from "express";
import { reportController } from "../controllers/report.controller";

const router = Router();

// GET /api/reports/:year  -> reporte anual
// GET /api/reports/:year/:month -> reporte mensual
router.get("/:year/:month?", (req, res) => reportController.getReport(req, res));

export default router;
