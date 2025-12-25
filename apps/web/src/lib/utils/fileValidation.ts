/**
 * File Validation Utilities
 * Server-side file validation for security
 */

export interface FileValidationResult {
  valid: boolean;
  error?: string;
  sanitizedName?: string;
}

/**
 * Allowed MIME types for file uploads
 */
export const ALLOWED_MIME_TYPES = {
  images: [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',
  ],
  documents: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
    'text/plain',
    'text/csv',
  ],
  all: [] as string[],
};

// Initialize all allowed types
ALLOWED_MIME_TYPES.all = [
  ...ALLOWED_MIME_TYPES.images,
  ...ALLOWED_MIME_TYPES.documents,
];

/**
 * Maximum file size in bytes
 * Default: 10MB
 */
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

/**
 * Sanitize file name to prevent directory traversal and other attacks
 * @param fileName Original file name
 * @returns Sanitized file name safe for storage
 */
export function sanitizeFileName(fileName: string): string {
  // Remove path components (directory traversal protection)
  const baseName = fileName.split(/[/\\]/).pop() || fileName;
  
  // Remove or replace dangerous characters
  let sanitized = baseName
    .replace(/[^a-zA-Z0-9._-]/g, '_') // Replace non-alphanumeric (except . _ -) with _
    .replace(/^\.+/, '') // Remove leading dots
    .replace(/\.+$/, '') // Remove trailing dots
    .replace(/_+/g, '_') // Replace multiple underscores with single
    .substring(0, 255); // Limit length
  
  // Ensure we have a valid name
  if (!sanitized || sanitized.length === 0) {
    sanitized = `file_${Date.now()}`;
  }
  
  return sanitized;
}

/**
 * Validate file MIME type
 * @param mimeType File MIME type
 * @param allowedTypes Array of allowed MIME types (default: all)
 * @returns True if valid
 */
export function validateMimeType(
  mimeType: string,
  allowedTypes: string[] = ALLOWED_MIME_TYPES.all
): boolean {
  return allowedTypes.includes(mimeType);
}

/**
 * Validate file size
 * @param size File size in bytes
 * @param maxSize Maximum allowed size in bytes (default: MAX_FILE_SIZE)
 * @returns True if valid
 */
export function validateFileSize(
  size: number,
  maxSize: number = MAX_FILE_SIZE
): boolean {
  return size > 0 && size <= maxSize;
}

/**
 * Get file extension from file name
 * @param fileName File name
 * @returns File extension (lowercase, without dot)
 */
export function getFileExtension(fileName: string): string {
  const parts = fileName.split('.');
  if (parts.length < 2) return '';
  const extension = parts[parts.length - 1];
  return extension ? extension.toLowerCase() : '';
}

/**
 * Validate file extension matches MIME type
 * @param fileName File name
 * @param mimeType File MIME type
 * @returns True if extension matches MIME type
 */
export function validateExtensionMatchesMimeType(
  fileName: string,
  mimeType: string
): boolean {
  const extension = getFileExtension(fileName);
  
  // MIME type to extension mapping
  const mimeToExt: Record<string, string[]> = {
    'image/jpeg': ['jpg', 'jpeg'],
    'image/jpg': ['jpg', 'jpeg'],
    'image/png': ['png'],
    'image/gif': ['gif'],
    'image/webp': ['webp'],
    'image/svg+xml': ['svg'],
    'application/pdf': ['pdf'],
    'application/msword': ['doc'],
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['docx'],
    'application/vnd.ms-excel': ['xls'],
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['xlsx'],
    'text/plain': ['txt'],
    'text/csv': ['csv'],
  };
  
  const allowedExtensions = mimeToExt[mimeType];
  if (!allowedExtensions) return false;
  
  return allowedExtensions.includes(extension);
}

/**
 * Comprehensive file validation
 * @param file File object or file metadata
 * @param options Validation options
 * @returns Validation result
 */
export function validateFile(
  file: { name: string; size: number; type: string },
  options: {
    allowedTypes?: string[];
    maxSize?: number;
    requireExtensionMatch?: boolean;
  } = {}
): FileValidationResult {
  const {
    allowedTypes = ALLOWED_MIME_TYPES.all,
    maxSize = MAX_FILE_SIZE,
    requireExtensionMatch = true,
  } = options;

  // Validate file size
  if (!validateFileSize(file.size, maxSize)) {
    return {
      valid: false,
      error: `File size exceeds maximum allowed size of ${Math.round(maxSize / 1024 / 1024)}MB`,
    };
  }

  // Validate MIME type
  if (!validateMimeType(file.type, allowedTypes)) {
    return {
      valid: false,
      error: `File type "${file.type}" is not allowed. Allowed types: ${allowedTypes.join(', ')}`,
    };
  }

  // Validate extension matches MIME type (prevent MIME type spoofing)
  if (requireExtensionMatch && !validateExtensionMatchesMimeType(file.name, file.type)) {
    return {
      valid: false,
      error: `File extension does not match MIME type. File: ${file.name}, MIME: ${file.type}`,
    };
  }

  // Sanitize file name
  const sanitizedName = sanitizeFileName(file.name);

  return {
    valid: true,
    sanitizedName,
  };
}

/**
 * Generate a unique file name using UUID pattern
 * @param originalFileName Original file name
 * @returns Unique file name with UUID prefix
 */
export function generateUniqueFileName(originalFileName: string): string {
  const sanitized = sanitizeFileName(originalFileName);
  const extension = getFileExtension(sanitized);
  const baseName = sanitized.replace(/\.[^/.]+$/, '') || 'file';
  
  // Generate UUID-like identifier
  const uuid = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
  
  return extension 
    ? `${baseName}-${uuid}.${extension}`
    : `${baseName}-${uuid}`;
}

