'use client';

import { useState } from 'react';
import { clsx } from 'clsx';
import FileUpload from './FileUpload';
import Button from './Button';

export interface FileUploadWithPreviewProps {
  label?: string;
  accept?: string;
  multiple?: boolean;
  onFileSelect?: (files: File[]) => void;
  maxSize?: number;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
}

export default function FileUploadWithPreview({
  label,
  accept,
  multiple = false,
  onFileSelect,
  maxSize,
  error,
  helperText,
  fullWidth,
}: FileUploadWithPreviewProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<Record<string, string>>({});

  const handleFileSelect = (selectedFiles: File[]) => {
    setFiles(selectedFiles);
    
    // Generate previews
    const newPreviews: Record<string, string> = {};
    selectedFiles.forEach((file) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          newPreviews[file.name] = reader.result as string;
          setPreviews((prev) => ({ ...prev, ...newPreviews }));
        };
        reader.readAsDataURL(file);
      }
    });
    
    onFileSelect?.(selectedFiles);
  };

  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    const fileToRemove = files[index];
    setFiles(newFiles);
    
    // Remove preview
    if (previews[fileToRemove.name]) {
      const newPreviews = { ...previews };
      delete newPreviews[fileToRemove.name];
      setPreviews(newPreviews);
    }
    
    onFileSelect?.(newFiles);
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      return null; // Will show preview instead
    }
    if (file.type.includes('pdf')) {
      return '📄';
    }
    if (file.type.includes('word') || file.type.includes('document')) {
      return '📝';
    }
    if (file.type.includes('excel') || file.type.includes('spreadsheet')) {
      return '📊';
    }
    return '📎';
  };

  return (
    <div className={clsx('space-y-4', fullWidth && 'w-full')}>
      <FileUpload
        label={label}
        accept={accept}
        multiple={multiple}
        onFileSelect={handleFileSelect}
        maxSize={maxSize}
        error={error}
        helperText={helperText}
        fullWidth={fullWidth}
      />

      {files.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {files.map((file, index) => (
            <div
              key={index}
              className="relative group border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-800"
            >
              {previews[file.name] ? (
                <div className="aspect-square relative">
                  <img
                    src={previews[file.name]}
                    alt={file.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity flex items-center justify-center">
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => removeFile(index)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      Supprimer
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="aspect-square flex flex-col items-center justify-center p-4">
                  <div className="text-4xl mb-2">{getFileIcon(file)}</div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 text-center truncate w-full px-2">
                    {file.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    {(file.size / 1024).toFixed(2)} KB
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(index)}
                    className="mt-2"
                  >
                    Supprimer
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

