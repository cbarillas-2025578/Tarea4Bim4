// backend/src/modules/auth/auth.service.ts
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import { pool } from '../database/database';

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID || '');

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

  async refresh(token: string) {
    try {
      const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'secret');

      const result = await pool.query(
        'SELECT * FROM usuarios WHERE id = $1',
        [decoded.id]
      );

      const user = result.rows[0];
      if (!user) throw new Error('Usuario no encontrado');

      const newToken = jwt.sign(
        { id: user.id, email: user.email },
        process.env.JWT_SECRET || 'secret',
        { expiresIn: '20m' }
      );

      return {
        token: newToken,
        user: {
          id: user.id,
          nombre: user.nombre,
          email: user.email
        }
      };
    } catch {
      throw new Error('Token inválido');
    }
  }

  async googleLogin(idToken: string) {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    if (!clientId) {
      throw new Error('Google login no configurado');
    }

    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: clientId,
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      throw new Error('Token de Google inválido');
    }

    const email = payload.email;
    const nombre = payload.name || email.split('@')[0] || 'Usuario';
    const googleSub = payload.sub;

    if (!googleSub) {
      throw new Error('Token de Google inválido');
    }

    let userResult = await pool.query(
      'SELECT * FROM usuarios WHERE email = $1 OR google_sub = $2',
      [email, googleSub]
    );
    let user = userResult.rows[0];

    if (!user) {
      const insertResult = await pool.query(
        `INSERT INTO usuarios (nombre, email, password, google_sub)
         VALUES ($1, $2, NULL, $3) RETURNING *`,
        [nombre, email, googleSub]
      );
      user = insertResult.rows[0];
    } else if (!user.google_sub) {
      await pool.query(
        'UPDATE usuarios SET google_sub = $1 WHERE id = $2',
        [googleSub, user.id]
      );
    }

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
}