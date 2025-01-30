// components/export/export-button.tsx
import { useState } from 'react';
import { Download } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { DateRangeSelect } from './date-range-select';
import { Button } from '@/components/ui/button';
import { exportData } from '@/lib/actions/export';

interface DateRange {
  startDate: Date;
  endDate: Date;
}

const ExportButton = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: new Date(),
    endDate: new Date(),
  });
  const [format, setFormat] = useState<'CSV' | 'PDF'>('CSV');
  const [includeAnalysis, setIncludeAnalysis] = useState(false);

  const handleExport = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await exportData({
        dateRange,
        format,
        includeAnalysis,
      });

      if (result.success && result.data) {
        // Create and download the CSV file
        const blob = new Blob([result.data], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `trades-export-${format.toLowerCase()}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        throw new Error(result.error || 'Export failed');
      }
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'Failed to export data. Please try again.'
      );
      console.error('Export failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className='w-full max-w-md'>
      <CardHeader>
        <CardTitle>Export Data</CardTitle>
      </CardHeader>
      <CardContent className='space-y-6'>
        <DateRangeSelect value={dateRange} onChange={setDateRange} />

        <div className='space-y-4'>
          <div className='space-y-2'>
            <Label>Export Format</Label>
            <Select
              value={format}
              onValueChange={(value) => setFormat(value as 'CSV' | 'PDF')}
            >
              <SelectTrigger>
                <SelectValue placeholder='Select format' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='CSV'>CSV</SelectItem>
                <SelectItem value='PDF'>PDF</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className='flex items-center space-x-2'>
            <Switch
              id='include-analysis'
              checked={includeAnalysis}
              onCheckedChange={setIncludeAnalysis}
            />
            <Label htmlFor='include-analysis'>Include AI Analysis</Label>
          </div>
        </div>

        {error && (
          <Alert variant='destructive'>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Button onClick={handleExport} disabled={loading} className='w-full'>
          <Download className='mr-2 h-4 w-4' />
          {loading ? 'Exporting...' : 'Export Data'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default ExportButton;
