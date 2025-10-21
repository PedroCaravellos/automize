import { useState, useCallback } from 'react';
import { z } from 'zod';

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  sanitized?: any;
}

/**
 * Hook para validação e sanitização segura de inputs
 * Previne XSS, SQL injection e outros ataques
 */
export function useSecureInput() {
  const [validationCache] = useState(new Map<string, ValidationResult>());

  const sanitizeString = useCallback((input: string): string => {
    if (!input) return '';
    
    // Remove tags HTML
    let sanitized = input.replace(/<[^>]*>/g, '');
    
    // Remove caracteres de controle
    sanitized = sanitized.replace(/[\x00-\x1F\x7F]/g, '');
    
    // Escapa caracteres especiais SQL
    sanitized = sanitized.replace(/['";\\]/g, '\\$&');
    
    return sanitized.trim();
  }, []);

  const sanitizeEmail = useCallback((email: string): string => {
    if (!email) return '';
    return email.toLowerCase().trim();
  }, []);

  const sanitizePhone = useCallback((phone: string): string => {
    if (!phone) return '';
    // Remove tudo exceto números, +, parênteses e hífens
    return phone.replace(/[^\d+()-]/g, '');
  }, []);

  const sanitizeUrl = useCallback((url: string): string => {
    if (!url) return '';
    
    try {
      const parsed = new URL(url);
      // Apenas permite HTTP e HTTPS
      if (!['http:', 'https:'].includes(parsed.protocol)) {
        return '';
      }
      return parsed.toString();
    } catch {
      return '';
    }
  }, []);

  const validateWithSchema = useCallback(
    <T>(schema: z.ZodSchema<T>, data: any): ValidationResult => {
      const cacheKey = JSON.stringify(data);
      
      if (validationCache.has(cacheKey)) {
        return validationCache.get(cacheKey)!;
      }

      try {
        const validated = schema.parse(data);
        const result: ValidationResult = {
          isValid: true,
          errors: [],
          sanitized: validated,
        };
        validationCache.set(cacheKey, result);
        return result;
      } catch (error) {
        if (error instanceof z.ZodError) {
          const result: ValidationResult = {
            isValid: false,
            errors: error.errors.map((e) => e.message),
          };
          validationCache.set(cacheKey, result);
          return result;
        }
        return {
          isValid: false,
          errors: ['Validation error'],
        };
      }
    },
    [validationCache]
  );

  const checkSQLInjection = useCallback((input: string): boolean => {
    const sqlPatterns = [
      /(\bSELECT\b|\bINSERT\b|\bUPDATE\b|\bDELETE\b|\bDROP\b|\bCREATE\b|\bALTER\b)/i,
      /(\bUNION\b|\bJOIN\b)/i,
      /(--|\*\/|\/\*)/,
      /(\bOR\b|\bAND\b)\s+['"]?\d+['"]?\s*=\s*['"]?\d+['"]?/i,
    ];

    return sqlPatterns.some((pattern) => pattern.test(input));
  }, []);

  const checkXSS = useCallback((input: string): boolean => {
    const xssPatterns = [
      /<script[^>]*>.*?<\/script>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /<iframe[^>]*>/gi,
      /<object[^>]*>/gi,
      /<embed[^>]*>/gi,
    ];

    return xssPatterns.some((pattern) => pattern.test(input));
  }, []);

  const validateSecure = useCallback(
    (input: string, type: 'string' | 'email' | 'url' = 'string'): ValidationResult => {
      const errors: string[] = [];

      if (!input || input.trim().length === 0) {
        return { isValid: false, errors: ['Campo obrigatório'] };
      }

      // Check for SQL injection
      if (checkSQLInjection(input)) {
        errors.push('Entrada contém padrões SQL não permitidos');
      }

      // Check for XSS
      if (checkXSS(input)) {
        errors.push('Entrada contém código potencialmente perigoso');
      }

      // Type-specific validation
      let sanitized = input;
      switch (type) {
        case 'email':
          sanitized = sanitizeEmail(input);
          if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(sanitized)) {
            errors.push('Email inválido');
          }
          break;
        case 'url':
          sanitized = sanitizeUrl(input);
          if (!sanitized) {
            errors.push('URL inválida');
          }
          break;
        default:
          sanitized = sanitizeString(input);
      }

      return {
        isValid: errors.length === 0,
        errors,
        sanitized,
      };
    },
    [checkSQLInjection, checkXSS, sanitizeEmail, sanitizeUrl, sanitizeString]
  );

  return {
    sanitizeString,
    sanitizeEmail,
    sanitizePhone,
    sanitizeUrl,
    validateWithSchema,
    validateSecure,
    checkSQLInjection,
    checkXSS,
  };
}
