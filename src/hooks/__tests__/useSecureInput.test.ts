import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useSecureInput } from '../useSecureInput';
import { z } from 'zod';

describe('useSecureInput', () => {
  describe('sanitizeString', () => {
    it('deve remover tags HTML', () => {
      const { result } = renderHook(() => useSecureInput());
      const sanitized = result.current.sanitizeString('<script>alert("xss")</script>Hello');
      expect(sanitized).toBe('alert("xss")Hello');
    });

    it('deve remover caracteres de controle', () => {
      const { result } = renderHook(() => useSecureInput());
      const sanitized = result.current.sanitizeString('Hello\x00World\x1F');
      expect(sanitized).toBe('HelloWorld');
    });
  });

  describe('sanitizeEmail', () => {
    it('deve converter email para lowercase e trim', () => {
      const { result } = renderHook(() => useSecureInput());
      const sanitized = result.current.sanitizeEmail('  TEST@EXAMPLE.COM  ');
      expect(sanitized).toBe('test@example.com');
    });
  });

  describe('sanitizePhone', () => {
    it('deve manter apenas números e caracteres permitidos', () => {
      const { result } = renderHook(() => useSecureInput());
      const sanitized = result.current.sanitizePhone('+55 (11) 99999-9999 ext 123');
      expect(sanitized).toBe('+55(11)99999-9999');
    });
  });

  describe('checkSQLInjection', () => {
    it('deve detectar padrões de SQL injection', () => {
      const { result } = renderHook(() => useSecureInput());
      
      expect(result.current.checkSQLInjection('SELECT * FROM users')).toBe(true);
      expect(result.current.checkSQLInjection('DROP TABLE users')).toBe(true);
      expect(result.current.checkSQLInjection("1' OR '1'='1")).toBe(true);
      expect(result.current.checkSQLInjection('Hello World')).toBe(false);
    });
  });

  describe('checkXSS', () => {
    it('deve detectar padrões de XSS', () => {
      const { result } = renderHook(() => useSecureInput());
      
      expect(result.current.checkXSS('<script>alert("xss")</script>')).toBe(true);
      expect(result.current.checkXSS('javascript:alert("xss")')).toBe(true);
      expect(result.current.checkXSS('<img onerror="alert(1)">')).toBe(true);
      expect(result.current.checkXSS('Hello World')).toBe(false);
    });
  });

  describe('validateSecure', () => {
    it('deve validar string segura', () => {
      const { result } = renderHook(() => useSecureInput());
      const validation = result.current.validateSecure('Hello World', 'string');
      
      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
      expect(validation.sanitized).toBe('Hello World');
    });

    it('deve detectar SQL injection', () => {
      const { result } = renderHook(() => useSecureInput());
      const validation = result.current.validateSecure("SELECT * FROM users", 'string');
      
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Entrada contém padrões SQL não permitidos');
    });

    it('deve detectar XSS', () => {
      const { result } = renderHook(() => useSecureInput());
      const validation = result.current.validateSecure('<script>alert(1)</script>', 'string');
      
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Entrada contém código potencialmente perigoso');
    });

    it('deve validar email', () => {
      const { result } = renderHook(() => useSecureInput());
      
      const validEmail = result.current.validateSecure('test@example.com', 'email');
      expect(validEmail.isValid).toBe(true);
      
      const invalidEmail = result.current.validateSecure('invalid-email', 'email');
      expect(invalidEmail.isValid).toBe(false);
      expect(invalidEmail.errors).toContain('Email inválido');
    });
  });

  describe('validateWithSchema', () => {
    it('deve validar com schema Zod', () => {
      const { result } = renderHook(() => useSecureInput());
      
      const schema = z.object({
        name: z.string().min(3),
        email: z.string().email(),
      });

      const validData = result.current.validateWithSchema(schema, {
        name: 'John',
        email: 'john@example.com',
      });
      
      expect(validData.isValid).toBe(true);
      expect(validData.sanitized).toEqual({
        name: 'John',
        email: 'john@example.com',
      });
    });

    it('deve retornar erros de validação', () => {
      const { result } = renderHook(() => useSecureInput());
      
      const schema = z.object({
        name: z.string().min(3),
        email: z.string().email(),
      });

      const invalidData = result.current.validateWithSchema(schema, {
        name: 'Jo',
        email: 'invalid',
      });
      
      expect(invalidData.isValid).toBe(false);
      expect(invalidData.errors.length).toBeGreaterThan(0);
    });
  });
});
