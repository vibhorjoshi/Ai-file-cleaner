/**
 * Authentication routes
 * POST /auth/login → issue HTTP-only session cookie (seed users in DB)
 * POST /license/generate → returns UUIDv4; stores license_keys with user_id
 */

import { FastifyPluginAsync } from 'fastify';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { query } from '../db/connection';
import { z } from 'zod';

// Request/Response schemas
const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

const LicenseGenerateSchema = z.object({
  userId: z.string().uuid()
});

interface User {
  id: string;
  email: string;
  password_hash: string;
  created_at: Date;
}

interface LicenseKey {
  key: string;
  user_id: string;
  created_at: Date;
  revoked: boolean;
}

export const authRoutes: FastifyPluginAsync = async (fastify) => {
  
  // POST /auth/login - Authentication with session cookie
  fastify.post('/login', async (request, reply) => {
    try {
      const body = LoginSchema.parse(request.body);
      
      // Find user in database
      const users = await query(
        'SELECT * FROM users WHERE email = $1',
        [body.email]
      ) as User[];
      
      if (users.length === 0) {
        return reply.code(401).send({ 
          success: false, 
          message: 'User not found' 
        });
      }
      
      const user = users[0];
      
      // Verify password
      const validPassword = await bcrypt.compare(body.password, user.password_hash);
      if (!validPassword) {
        return reply.code(401).send({ 
          success: false, 
          message: 'Invalid password' 
        });
      }
      
      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET || 'default-secret',
        { expiresIn: '2h' }
      );
      
      // Set HTTP-only session cookie
      reply.setCookie('session', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 2 * 60 * 60 * 1000 // 2 hours
      });
      
      return {
        success: true,
        user: {
          id: user.id,
          email: user.email
        },
        message: 'Login successful'
      };
      
    } catch (error) {
      fastify.log.error('Login error:', error);
      return reply.code(500).send({ 
        success: false, 
        message: 'Internal server error' 
      });
    }
  });
  
  // POST /license/generate - Generate desktop license key
  fastify.post('/license/generate', async (request, reply) => {
    try {
      const body = LicenseGenerateSchema.parse(request.body);
      
      // Verify user exists
      const users = await query(
        'SELECT id FROM users WHERE id = $1',
        [body.userId]
      ) as Pick<User, 'id'>[];
      
      if (users.length === 0) {
        return reply.code(404).send({ 
          success: false, 
          message: 'User not found' 
        });
      }
      
      // Generate new license key
      const licenseKey = uuidv4();
      
      await query(
        'INSERT INTO license_keys (key, user_id) VALUES ($1, $2)',
        [licenseKey, body.userId]
      );
      
      return {
        success: true,
        license_key: licenseKey,
        user_id: body.userId,
        created_at: new Date().toISOString()
      };
      
    } catch (error) {
      fastify.log.error('License generation error:', error);
      return reply.code(500).send({ 
        success: false, 
        message: 'Failed to generate license key' 
      });
    }
  });
  
  // GET /auth/me - Get current user (from session)
  fastify.get('/me', async (request, reply) => {
    try {
      const sessionCookie = request.cookies.session;
      
      if (!sessionCookie) {
        return reply.code(401).send({ 
          success: false, 
          message: 'Not authenticated' 
        });
      }
      
      // Verify JWT token
      const decoded = jwt.verify(
        sessionCookie, 
        process.env.JWT_SECRET || 'default-secret'
      ) as any;
      
      // Get user details
      const users = await query(
        'SELECT id, email, created_at FROM users WHERE id = $1',
        [decoded.userId]
      ) as Omit<User, 'password_hash'>[];
      
      if (users.length === 0) {
        return reply.code(401).send({ 
          success: false, 
          message: 'User not found' 
        });
      }
      
      return {
        success: true,
        user: users[0]
      };
      
    } catch (error) {
      fastify.log.error('Auth verification error:', error);
      return reply.code(401).send({ 
        success: false, 
        message: 'Invalid session' 
      });
    }
  });
  
  // POST /auth/logout - Clear session
  fastify.post('/logout', async (request, reply) => {
    reply.clearCookie('session');
    return { 
      success: true, 
      message: 'Logged out successfully' 
    };
  });
  
};