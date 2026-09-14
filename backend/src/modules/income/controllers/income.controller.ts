import { Request, Response } from "express";
import { incomeService } from "../services/income.service";
import { AuthenticatedRequest } from "../../../middleware/auth.middleware";

export class IncomeController {
  async create(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { amount, source, description, transactionDate } = req.body;

      if (amount === undefined || !source || !transactionDate) {
        res.status(400).json({ message: "amount, source y transactionDate son requeridos" });
        return;
      }
      if (typeof amount !== "number" || amount <= 0) {
        res.status(400).json({ message: "amount debe ser un número positivo" });
        return;
      }

      const income = await incomeService.create({ amount, source, description, transactionDate }, req.userId);
      res.status(201).json(income);
    } catch (error) {
      res.status(500).json({ message: "Error al crear el ingreso", error: String(error) });
    }
  }

  async findAll(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { month, year, source } = req.query;
      const incomes = await incomeService.findAll({
        month: month ? Number(month) : undefined,
        year: year ? Number(year) : undefined,
        source: source ? String(source) : undefined,
      }, req.userId);
      res.status(200).json(incomes);
    } catch (error) {
      res.status(500).json({ message: "Error al obtener los ingresos", error: String(error) });
    }
  }

  async findOne(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const id = Number(req.params.id);
      const income = await incomeService.findById(id, req.userId);
      if (!income) {
        res.status(404).json({ message: "Ingreso no encontrado" });
        return;
      }
      res.status(200).json(income);
    } catch (error) {
      res.status(500).json({ message: "Error al obtener el ingreso", error: String(error) });
    }
  }

  async update(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const id = Number(req.params.id);
      const updated = await incomeService.update(id, req.body, req.userId);
      if (!updated) {
        res.status(404).json({ message: "Ingreso no encontrado" });
        return;
      }
      res.status(200).json(updated);
    } catch (error) {
      res.status(500).json({ message: "Error al actualizar el ingreso", error: String(error) });
    }
  }

  async delete(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const id = Number(req.params.id);
      const deleted = await incomeService.delete(id, req.userId);
      if (!deleted) {
        res.status(404).json({ message: "Ingreso no encontrado" });
        return;
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Error al eliminar el ingreso", error: String(error) });
    }
  }
}

export const incomeController = new IncomeController();
