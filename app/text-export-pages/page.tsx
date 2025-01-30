'use client';
import React from 'react';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import ExportButton from '../../components/export/export-button';
import { exportData, ExportOptions } from '../../lib/actions/export';

const TestExportPage = () => {
  const [testResults, setTestResults] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Test with various date ranges
  const testCases: Array<{
    name: string;
    options: ExportOptions;
  }> = [
    {
      name: "Today's Data",
      options: {
        dateRange: {
          startDate: new Date(),
          endDate: new Date(),
        },
        includeAnalysis: false,
        format: 'CSV' as const, // explicitly type as 'CSV'
      },
    },
    {
      name: 'Last 7 Days',
      options: {
        dateRange: {
          startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          endDate: new Date(),
        },
        includeAnalysis: true,
        format: 'CSV' as const, // explicitly type as 'CSV'
      },
    },
  ];

  const runTest = async (testCase: (typeof testCases)[0]) => {
    try {
      setError(null);
      const result = await exportData(testCase.options);

      if (result.success && result.data) {
        // Create a blob and download it
        const blob = new Blob([result.data], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `export-${testCase.name.toLowerCase().replace(/\s+/g, '-')}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        setTestResults((prev) => [
          ...prev,
          {
            name: testCase.name,
            status: 'SUCCESS',
            metadata: result.metadata,
            timestamp: new Date().toISOString(),
          },
        ]);
      } else {
        throw new Error(result.error || 'Export failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Test failed');
      setTestResults((prev) => [
        ...prev,
        {
          name: testCase.name,
          status: 'FAILED',
          error: err instanceof Error ? err.message : 'Unknown error',
          timestamp: new Date().toISOString(),
        },
      ]);
    }
  };

  const clearResults = () => {
    setTestResults([]);
    setError(null);
  };

  return (
    <div className='p-6 space-y-6'>
      <Card>
        <CardHeader>
          <CardTitle>Export Feature Test Page</CardTitle>
        </CardHeader>
        <CardContent className='space-y-6'>
          {/* Regular Export Button Component */}
          <div className='border-b pb-6'>
            <h3 className='text-lg font-medium mb-4'>1. Test UI Component</h3>
            <ExportButton />
          </div>

          {/* Test Cases */}
          <div>
            <h3 className='text-lg font-medium mb-4'>2. Test CSV Generation</h3>
            <div className='space-y-4'>
              {testCases.map((testCase, index) => (
                <Button
                  key={index}
                  onClick={() => runTest(testCase)}
                  variant='outline'
                >
                  Test: {testCase.name}
                </Button>
              ))}

              <Button variant='secondary' onClick={clearResults}>
                Clear Results
              </Button>
            </div>
          </div>

          {/* Display Error */}
          {error && (
            <Alert variant='destructive'>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Display Test Results */}
          {testResults.length > 0 && (
            <div className='mt-6'>
              <h3 className='text-lg font-medium mb-4'>Test Results</h3>
              <div className='space-y-2'>
                {testResults.map((result, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-md ${
                      result.status === 'SUCCESS'
                        ? 'bg-green-50 border border-green-200 text-green-900'
                        : 'bg-red-50 border border-red-200 text-red-900'
                    }`}
                  >
                    <p className='font-medium text-gray-900'>{result.name}</p>
                    <p className='text-sm text-gray-700'>
                      Status: {result.status}
                    </p>
                    <p className='text-sm text-gray-700'>
                      Time: {new Date(result.timestamp).toLocaleTimeString()}
                    </p>
                    {result.metadata && (
                      <pre className='text-xs mt-2 bg-white p-2 rounded text-gray-900'>
                        {JSON.stringify(result.metadata, null, 2)}
                      </pre>
                    )}
                    {result.error && (
                      <p className='text-sm text-red-700 mt-2'>
                        {result.error}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TestExportPage;
