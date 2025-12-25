/**
 * Comprehensive Tests for File Validation Utilities
 */

import { describe, it, expect } from 'vitest';
import {
  validateFileSize,
  validateFileType,
  validateFileName,
  validateImageFile,
} from '../fileValidation';

describe('File Validation Utilities', () => {
  describe('validateFileSize', () => {
    it('should validate file size within limit', () => {
      const file = new File(['content'], 'test.txt', { type: 'text/plain' });
      Object.defineProperty(file, 'size', { value: 1024 }); // 1KB
      
      expect(validateFileSize(file, 2048)).toBe(true);
    });

    it('should reject file exceeding size limit', () => {
      const file = new File(['content'], 'test.txt', { type: 'text/plain' });
      Object.defineProperty(file, 'size', { value: 2048 }); // 2KB
      
      expect(validateFileSize(file, 1024)).toBe(false);
    });
  });

  describe('validateFileType', () => {
    it('should validate allowed file type', () => {
      const file = new File(['content'], 'test.pdf', { type: 'application/pdf' });
      
      expect(validateFileType(file, ['application/pdf', 'image/jpeg'])).toBe(true);
    });

    it('should reject disallowed file type', () => {
      const file = new File(['content'], 'test.exe', { type: 'application/x-msdownload' });
      
      expect(validateFileType(file, ['application/pdf', 'image/jpeg'])).toBe(false);
    });
  });

  describe('validateFileName', () => {
    it('should validate safe file name', () => {
      expect(validateFileName('test-file.txt')).toBe(true);
      expect(validateFileName('document_123.pdf')).toBe(true);
    });

    it('should reject dangerous file names', () => {
      expect(validateFileName('../../../etc/passwd')).toBe(false);
      expect(validateFileName('file<script>.txt')).toBe(false);
      expect(validateFileName('file\x00name.txt')).toBe(false);
    });
  });

  describe('validateImageFile', () => {
    it('should validate image file', () => {
      const file = new File(['content'], 'test.jpg', { type: 'image/jpeg' });
      Object.defineProperty(file, 'size', { value: 1024 });
      
      expect(validateImageFile(file, 2048)).toBe(true);
    });

    it('should reject non-image file', () => {
      const file = new File(['content'], 'test.txt', { type: 'text/plain' });
      
      expect(validateImageFile(file, 2048)).toBe(false);
    });

    it('should reject image exceeding size limit', () => {
      const file = new File(['content'], 'test.jpg', { type: 'image/jpeg' });
      Object.defineProperty(file, 'size', { value: 2048 });
      
      expect(validateImageFile(file, 1024)).toBe(false);
    });
  });
});

