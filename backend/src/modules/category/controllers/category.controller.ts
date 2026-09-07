import { Request, Response } from "express";
import { categoryService } from "../services/category.service";

export class CategoryController {
  async create(req: Request, res: Response): Promise<void> {
    try {
      const { name, type, color, icon } = req.body;

      if (!name || !type) {
        res.status(400).json({ message: "name y type son requeridos" });
        return;
      }

      const category = await categoryService.create({ name, type, color, icon });
      res.status(201).json(category);
    } catch (error) {
      res.status(500).json({ message: "Error al crear la categoría", error: String(error) });
    }
  }

  async findAll(req: Request, res: Response): Promise<void> {
    try {
      const { type } = req.query;
      const categories = await categoryService.findAll(type ? String(type) : undefined);
      res.status(200).json(categories);
    } catch (error) {
      res.status(500).json({ message: "Error al obtener las categorías", error: String(error) });
    }
  }

  async findOne(req: Request, res: Response): Promise<void> {
    try {
      const id = Number(req.params.id);
      const category = await categoryService.findById(id);
      if (!category) {
        res.status(404).json({ message: "Categoría no encontrada" });
        return;
      }
      res.status(200).json(category);
    } catch (error) {
      res.status(500).json({ message: "Error al obtener la categoría", error: String(error) });
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      const id = Number(req.params.id);
      const updated = await categoryService.update(id, req.body);
      if (!updated) {
        res.status(404).json({ message: "Categoría no encontrada" });
        return;
      }
      res.status(200).json(updated);
    } catch (error) {
      res.status(500).json({ message: "Error al actualizar la categoría", error: String(error) });
    }
  }

  async delete(req: Request, res: Response): Promise<void> {
    try {
      const id = Number(req.params.id);
      const deleted = await categoryService.delete(id);
      if (!deleted) {
        res.status(404).json({ message: "Categoría no encontrada" });
        return;
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Error al eliminar la categoría", error: String(error) });
    }
  }
}

export const categoryController = new CategoryController();
