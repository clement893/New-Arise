'use client';

import { useState } from 'react';
import Button from '@/components/ui/Button';
import { FileSpreadsheet, FileText, FileJson, FileType } from 'lucide-react';
import { apiClient } from '@/lib/api/client';

interface DataExporterProps {
  data: Record<string, unknown>[];
  filename?: string;
  headers?: string[];
  title?: string;
  className?: string;
}

export function DataExporter({
  data,
  filename,
  headers,
  title,
  className = '',
}: DataExporterProps) {
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  const handleExport = async (format: 'csv' | 'excel' | 'json' | 'pdf') => {
    if (!data || data.length === 0) {
      toast({
        title: 'No Data',
        description: 'There is no data to export.',
        variant: 'destructive',
      });
      return;
    }

    setIsExporting(true);

    try {
      const response = await apiClient.post(
        '/api/v1/exports/export',
        {
          format,
          data,
          headers,
          filename,
          title,
        },
        {
          responseType: 'blob',
        }
      );

      // Create download link
      const blob = new Blob([response.data], {
        type: response.headers['content-type'] || 'application/octet-stream',
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Get filename from Content-Disposition header or use default
      const contentDisposition = response.headers['content-disposition'];
      let downloadFilename = filename || `export_${new Date().toISOString().split('T')[0]}`;
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?(.+)"?/i);
        if (filenameMatch) {
          downloadFilename = filenameMatch[1];
        }
      } else {
        downloadFilename = `${downloadFilename}.${format === 'excel' ? 'xlsx' : format}`;
      }
      
      link.download = downloadFilename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({
        title: 'Export Successful',
        description: `Data exported as ${format.toUpperCase()} successfully.`,
      });
    } catch (error: any) {
      console.error('Export error:', error);
      toast({
        title: 'Export Failed',
        description: error.response?.data?.detail || 'Failed to export data.',
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className={`flex gap-2 ${className}`}>
      <Button
        onClick={() => handleExport('csv')}
        disabled={isExporting || !data || data.length === 0}
        variant="outline"
        size="sm"
      >
        <FileText className="h-4 w-4 mr-2" />
        CSV
      </Button>
      <Button
        onClick={() => handleExport('excel')}
        disabled={isExporting || !data || data.length === 0}
        variant="outline"
        size="sm"
      >
        <FileSpreadsheet className="h-4 w-4 mr-2" />
        Excel
      </Button>
      <Button
        onClick={() => handleExport('json')}
        disabled={isExporting || !data || data.length === 0}
        variant="outline"
        size="sm"
      >
        <FileJson className="h-4 w-4 mr-2" />
        JSON
      </Button>
      <Button
        onClick={() => handleExport('pdf')}
        disabled={isExporting || !data || data.length === 0}
        variant="outline"
        size="sm"
      >
        <FileType className="h-4 w-4 mr-2" />
        PDF
      </Button>
    </div>
  );
}

