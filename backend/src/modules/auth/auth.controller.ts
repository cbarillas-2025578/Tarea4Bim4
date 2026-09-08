import { Request, Response } from 'express';
import { AuthService } from './auth.service.js';

export class AuthController {
  constructor(private authService: AuthService) {}

  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      const result = await this.authService.login(email, password);
      res.json(result);
    } catch (error) {
      res.status(401).json({ message: 'Credenciales incorrectas' });
    }
  }

  async register(req: Request, res: Response) {
    try {
      const user = await this.authService.register(req.body);
      res.status(201).json(user);
    } catch (error) {
      res.status(400).json({ message: 'Error al registrar usuario' });
    }
  }

  async refresh(req: Request, res: Response) {
    try {
      const { token } = req.body;
      if (!token) {
        res.status(401).json({ message: 'Token requerido' });
        return;
      }
      const result = await this.authService.refresh(token);
      res.json(result);
    } catch (error) {
      res.status(401).json({ message: 'Token inválido o expirado' });
    }
  }
}