import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthenticatedRequest extends Request {
  userId: number;
}

export function authenticate(req: Request, res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  const token = header && header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    res.status(401).json({ message: "Token requerido" });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret") as { id: number };
    (req as AuthenticatedRequest).userId = decoded.id;
    next();
  } catch {
    res.status(401).json({ message: "Token inválido o expirado" });
  }
}