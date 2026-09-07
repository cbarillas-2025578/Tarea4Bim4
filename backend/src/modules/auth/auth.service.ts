// backend/src/modules/auth/auth.service.ts
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { pool } from '../database/database';

export class AuthService {
  async login(email: string, password: string) {
    const result = await pool.query(
      'SELECT * FROM usuarios WHERE email = $1',
      [email]
    );
    
    const user = result.rows[0];
    if (!user) throw new Error('Usuario no encontrado');
    
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) throw new Error('Contraseña incorrecta');
    
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '20m' }
    );
    
    return { 
      token, 
      user: { 
        id: user.id, 
        nombre: user.nombre, 
        email: user.email 
      } 
    };
  }

  async register(userData: any) {
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const result = await pool.query(
      `INSERT INTO usuarios (nombre, email, password) 
       VALUES ($1, $2, $3) RETURNING *`,
      [userData.nombre, userData.email, hashedPassword]
    );
    return result.rows[0];
  }
}