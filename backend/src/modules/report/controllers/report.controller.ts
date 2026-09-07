import { Request, Response } from "express";
import { reportService } from "../services/report.service";

export class ReportController {
  async getReport(req: Request, res: Response): Promise<void> {
    try {
      const year = Number(req.params.year) || new Date().getFullYear();
      const month = req.params.month ? Number(req.params.month) : undefined;

      if (month !== undefined && (month < 1 || month > 12)) {
        res.status(400).json({ message: "month debe estar entre 1 y 12" });
        return;
      }

      const report = await reportService.getReport(year, month);
      res.status(200).json(report);
    } catch (error) {
      res.status(500).json({ message: "Error al generar el reporte", error: String(error) });
    }
  }
}

export const reportController = new ReportController();
