import { Request, Response } from "express";
import { expenseService } from "../services/expense.service";
import { incomeService } from "../../income/services/income.service";

export class ExpenseController {
  async create(req: Request, res: Response): Promise<void> {
    try {
      const { amount, category, transactionDate } = req.body;

      if (amount === undefined || !category || !transactionDate) {
        res.status(400).json({ message: "amount, category y transactionDate son requeridos" });
        return;
      }
      if (typeof amount !== "number" || amount <= 0) {
        res.status(400).json({ message: "amount debe ser un número positivo" });
        return;
      }

      const [totalIncome, totalExpenses] = await Promise.all([
        incomeService.sum(),
        expenseService.sum(),
      ]);
      const available = totalIncome - totalExpenses;
      if (amount > available) {
        res.status(400).json({ message: "Saldo insuficiente" });
        return;
      }

      const expense = await expenseService.create({ amount, category, transactionDate });
      res.status(201).json(expense);
    } catch (error) {
      res.status(500).json({ message: "Error al crear el gasto", error: String(error) });
    }
  }

  async findAll(req: Request, res: Response): Promise<void> {
    try {
      const { month, year, category } = req.query;
      const expenses = await expenseService.findAll({
        month: month ? Number(month) : undefined,
        year: year ? Number(year) : undefined,
        category: category ? String(category) : undefined,
      });
      res.status(200).json(expenses);
    } catch (error) {
      res.status(500).json({ message: "Error al obtener los gastos", error: String(error) });
    }
  }

  async findOne(req: Request, res: Response): Promise<void> {
    try {
      const id = Number(req.params.id);
      const expense = await expenseService.findById(id);
      if (!expense) {
        res.status(404).json({ message: "Gasto no encontrado" });
        return;
      }
      res.status(200).json(expense);
    } catch (error) {
      res.status(500).json({ message: "Error al obtener el gasto", error: String(error) });
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      const id = Number(req.params.id);
      const existing = await expenseService.findById(id);
      if (!existing) {
        res.status(404).json({ message: "Gasto no encontrado" });
        return;
      }

      const amount = req.body.amount ?? existing.amount;
      if (typeof amount !== "number" || amount <= 0) {
        res.status(400).json({ message: "amount debe ser un número positivo" });
        return;
      }

      const [totalIncome, otherExpenses] = await Promise.all([
        incomeService.sum(),
        expenseService.sum(id),
      ]);
      const available = totalIncome - otherExpenses;
      if (amount > available) {
        res.status(400).json({ message: "Saldo insuficiente" });
        return;
      }

      const updated = await expenseService.update(id, req.body);
      if (!updated) {
        res.status(404).json({ message: "Gasto no encontrado" });
        return;
      }
      res.status(200).json(updated);
    } catch (error) {
      res.status(500).json({ message: "Error al actualizar el gasto", error: String(error) });
    }
  }

  async delete(req: Request, res: Response): Promise<void> {
    try {
      const id = Number(req.params.id);
      const deleted = await expenseService.delete(id);
      if (!deleted) {
        res.status(404).json({ message: "Gasto no encontrado" });
        return;
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Error al eliminar el gasto", error: String(error) });
    }
  }
}

export const expenseController = new ExpenseController();
